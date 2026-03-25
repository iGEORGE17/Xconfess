import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationQueue,
  CommentNotificationPayload,
} from './notification.queue';
import {
  EmailService,
  TemplateVariableValidationError,
} from '../email/email.service';
import { AppLogger } from '../logger/logger.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';

// NotificationQueue schedules periodic cleanup via setInterval in its ctor.
// Disable intervals for unit tests to avoid open-handle warnings.
const setIntervalSpy = jest
  .spyOn(global as any, 'setInterval')
  .mockImplementation(() => 0 as any);

// ── Redis mock ────────────────────────────────────────────────────────────────
const mockRedisSet = jest.fn();
const mockLogNotificationDlqReplay = jest.fn();
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    set: mockRedisSet,
    quit: jest.fn().mockResolvedValue(undefined),
  }));
});

// ── BullMQ mock ───────────────────────────────────────────────────────────────
const mockQueueAdd = jest.fn();
const mockQueueClose = jest.fn().mockResolvedValue(undefined);
const mockQueueGetJobCounts = jest
  .fn()
  .mockResolvedValue({ waiting: 0, active: 0, delayed: 0, failed: 0 });
const mockQueueGetJobs = jest.fn().mockResolvedValue([]);
const mockQueueGetJob = jest.fn().mockResolvedValue(null);
const mockWorkerClose = jest.fn().mockResolvedValue(undefined);
const mockWorkerOn = jest.fn();

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: mockQueueAdd,
    close: mockQueueClose,
    getJobCounts: mockQueueGetJobCounts,
    getFailedCount: jest.fn().mockResolvedValue(0),
    getJobs: mockQueueGetJobs,
    getJob: mockQueueGetJob,
  })),
  Worker: jest.fn().mockImplementation(() => ({
    on: mockWorkerOn,
    close: mockWorkerClose,
  })),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────
const makePayload = (
  overrides: Partial<CommentNotificationPayload> = {},
): CommentNotificationPayload => ({
  confession: { id: 'confession-abc' } as any,
  comment: { id: 'comment-xyz', content: 'Hello world' } as any,
  recipientEmail: 'user@example.com',
  channel: 'email_comment_notification',
  ...overrides,
});

describe('NotificationQueue', () => {
  let service: NotificationQueue;
  let logger: jest.Mocked<AppLogger>;
  let emailServiceMock: { sendGenericNotification: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();
    emailServiceMock = {
      sendGenericNotification: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationQueue,
        {
          provide: ConfigService,
          useValue: { get: jest.fn((key: string, def: any) => def) },
        },
        {
          provide: EmailService,
          useValue: emailServiceMock,
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: AppLogger,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
            incrementCounter: jest.fn(),
            setGauge: jest.fn(),
            observeTimer: jest.fn(),
            getMetricsSnapshot: jest
              .fn()
              .mockReturnValue({ counters: [], gauges: [], timers: [] }),
          },
        },
        {
          provide: AuditLogService,
          useValue: { logNotificationDlqReplay: mockLogNotificationDlqReplay },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: 'DLQ_RETENTION_CONFIG',
          useValue: { retentionDays: 14, cleanupBatchSize: 100, dryRun: false },
        },
      ],
    }).compile();

    service = module.get<NotificationQueue>(NotificationQueue);
    logger = module.get(AppLogger);
  });

  afterAll(() => {
    setIntervalSpy.mockRestore();
  });

  // ── buildIdempotencyKey ──────────────────────────────────────────────────────

  describe('buildIdempotencyKey', () => {
    it('produces the same key for identical inputs', () => {
      const fields = {
        eventType: 'comment-notification',
        recipientEmail: 'a@b.com',
        entityId: 'c1',
      };
      expect(service.buildIdempotencyKey(fields)).toBe(
        service.buildIdempotencyKey(fields),
      );
    });

    it('produces different keys for different confession IDs', () => {
      const base = {
        eventType: 'comment-notification',
        recipientEmail: 'a@b.com',
      };
      const k1 = service.buildIdempotencyKey({ ...base, entityId: 'c1' });
      const k2 = service.buildIdempotencyKey({ ...base, entityId: 'c2' });
      expect(k1).not.toBe(k2);
    });

    it('produces different keys for different recipient emails', () => {
      const base = { eventType: 'comment-notification', entityId: 'c1' };
      const k1 = service.buildIdempotencyKey({
        ...base,
        recipientEmail: 'a@b.com',
      });
      const k2 = service.buildIdempotencyKey({
        ...base,
        recipientEmail: 'x@y.com',
      });
      expect(k1).not.toBe(k2);
    });

    it('key starts with the dedupe prefix and contains a 64-char hex hash', () => {
      const key = service.buildIdempotencyKey({
        eventType: 'comment-notification',
        recipientEmail: 'a@b.com',
        entityId: 'c1',
      });
      expect(key).toMatch(/^notif:dedupe:[a-f0-9]{64}$/);
    });
  });

  // ── enqueueCommentNotification ───────────────────────────────────────────────

  describe('enqueueCommentNotification', () => {
    it('enqueues a job when Redis SET NX succeeds (no duplicate)', async () => {
      mockRedisSet.mockResolvedValue('OK');
      mockQueueAdd.mockResolvedValue({ id: 'job-1' });

      await service.enqueueCommentNotification(makePayload());

      expect(mockRedisSet).toHaveBeenCalledWith(
        expect.stringMatching(/^notif:dedupe:/),
        '1',
        'EX',
        expect.any(Number),
        'NX',
      );
      expect(mockQueueAdd).toHaveBeenCalledTimes(1);
    });

    it('suppresses the job when Redis SET NX returns null (duplicate within TTL)', async () => {
      mockRedisSet.mockResolvedValue(null);

      await service.enqueueCommentNotification(makePayload());

      expect(mockQueueAdd).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('idempotency'),
        'NotificationQueue',
      );
    });

    it('increments the suppression counter on dedupe', async () => {
      mockRedisSet.mockResolvedValue(null);

      await service.enqueueCommentNotification(makePayload());

      expect(logger.incrementCounter).toHaveBeenCalledWith(
        'notification_dedupe_suppressed_total',
        1,
        expect.objectContaining({ queue: 'comment-notifications' }),
      );
    });

    // ── Race condition ─────────────────────────────────────────────────────────

    it('handles race: two concurrent calls — only one enqueues', async () => {
      // Redis atomicity: first caller gets OK, second gets null
      mockRedisSet.mockResolvedValueOnce('OK').mockResolvedValueOnce(null);
      mockQueueAdd.mockResolvedValue({ id: 'job-1' });

      const payload = makePayload();
      const [,] = await Promise.all([
        service.enqueueCommentNotification(payload),
        service.enqueueCommentNotification(payload),
      ]);

      expect(mockQueueAdd).toHaveBeenCalledTimes(1);
      expect(logger.warn).toHaveBeenCalledTimes(1); // one suppression logged
    });

    it('handles retry scenario: same payload after TTL expiry enqueues again', async () => {
      // First call succeeds
      mockRedisSet.mockResolvedValueOnce('OK');
      mockQueueAdd.mockResolvedValue({ id: 'job-1' });
      await service.enqueueCommentNotification(makePayload());

      // After TTL expires, Redis no longer holds the key — SET NX succeeds again
      mockRedisSet.mockResolvedValueOnce('OK');
      mockQueueAdd.mockResolvedValue({ id: 'job-2' });
      await service.enqueueCommentNotification(makePayload());

      expect(mockQueueAdd).toHaveBeenCalledTimes(2);
    });

    // ── Distinct events ────────────────────────────────────────────────────────

    it('enqueues separate jobs for distinct confession IDs', async () => {
      mockRedisSet.mockResolvedValue('OK');
      mockQueueAdd.mockResolvedValue({ id: 'job-x' });

      await service.enqueueCommentNotification(
        makePayload({ confession: { id: 'confession-1' } as any }),
      );
      await service.enqueueCommentNotification(
        makePayload({ confession: { id: 'confession-2' } as any }),
      );

      expect(mockQueueAdd).toHaveBeenCalledTimes(2);
    });

    it('enqueues separate jobs for distinct recipient emails', async () => {
      mockRedisSet.mockResolvedValue('OK');
      mockQueueAdd.mockResolvedValue({ id: 'job-x' });

      await service.enqueueCommentNotification(
        makePayload({ recipientEmail: 'a@x.com' }),
      );
      await service.enqueueCommentNotification(
        makePayload({ recipientEmail: 'b@x.com' }),
      );

      expect(mockQueueAdd).toHaveBeenCalledTimes(2);
    });

    // ── Sensitive data ─────────────────────────────────────────────────────────

    it('does not log the recipient email in the dedup warn message', async () => {
      mockRedisSet.mockResolvedValue(null);

      await service.enqueueCommentNotification(
        makePayload({ recipientEmail: 'secret@example.com' }),
      );

      const warnMessage: string = logger.warn.mock.calls[0][0];
      expect(warnMessage).not.toContain('secret@example.com');
    });
  });

  describe('processNotification', () => {
    it('logs and rethrows when sendGenericNotification fails', async () => {
      const validationError = new TemplateVariableValidationError(
        'comment_notification',
        'v2',
        [
          {
            code: 'unknown',
            key: 'extraField',
            expected: 'not_allowed',
            actual: 'string',
          },
        ],
      );

      emailServiceMock.sendGenericNotification.mockRejectedValue(
        validationError,
      );

      await expect(
        (service as any).processNotification(
          'comment-notification',
          makePayload(),
        ),
      ).rejects.toThrow(TemplateVariableValidationError);

      expect(logger.error).toHaveBeenCalledWith(
        `Failed to process comment-notification notification: ${validationError.message}`,
        undefined,
        'NotificationQueue',
      );
    });
  });

  describe('replayDlqJob', () => {
    it('replays successfully when dedupe slot is available', async () => {
      const retry = jest.fn().mockResolvedValue(undefined);
      const job = {
        id: '1',
        name: 'comment-notification',
        data: { recipientEmail: 'user@example.com', commentId: 'c1' },
        retry,
      };

      mockQueueGetJob.mockResolvedValue(job as any);
      mockRedisSet.mockResolvedValue('OK');

      const res = await service.replayDlqJob('1', 'admin-1', 'manual');

      expect(retry).toHaveBeenCalledTimes(1);
      expect(res.status).toBe('replayed');
      expect(mockLogNotificationDlqReplay).toHaveBeenCalledWith(
        'admin-1',
        expect.objectContaining({
          replayType: 'single',
          queue: 'comment-notifications',
          jobId: '1',
          reason: 'manual',
        }),
      );
    });

    it('skips replay when dedupe slot is not available', async () => {
      const retry = jest.fn().mockResolvedValue(undefined);
      const job = {
        id: '1',
        name: 'comment-notification',
        data: { recipientEmail: 'user@example.com', commentId: 'c1' },
        retry,
      };

      mockQueueGetJob.mockResolvedValue(job as any);
      mockRedisSet.mockResolvedValue(null);

      const res = await service.replayDlqJob('1', 'admin-1', 'manual');

      expect(retry).not.toHaveBeenCalled();
      expect(res.status).toBe('skipped');
      expect(mockLogNotificationDlqReplay).toHaveBeenCalledWith(
        'admin-1',
        expect.objectContaining({
          replayType: 'single',
          summary: { attempted: 1, replayed: 0, failed: 0 },
        }),
      );
    });
  });

  describe('replayDlqJobsBulk', () => {
    it('skips jobs when dedupe suppresses duplicate replays', async () => {
      const failedJob = {
        id: 1,
        name: 'comment-notification',
        timestamp: Date.now(),
        finishedOn: null,
        attemptsMade: 3,
        failedReason: 'boom',
        opts: { attempts: 3 },
        data: {
          recipientEmail: 'user@example.com',
          commentId: 'c1',
          channel: 'email_comment_notification',
        },
      };

      const queuedJob = {
        id: '1',
        name: 'comment-notification',
        data: {
          recipientEmail: 'user@example.com',
          commentId: 'c1',
        },
        retry: jest.fn().mockResolvedValue(undefined),
      };

      mockQueueGetJobs.mockResolvedValue([failedJob as any]);
      mockQueueGetJob.mockResolvedValue(queuedJob as any);
      mockRedisSet.mockResolvedValue(null);

      const result = await service.replayDlqJobsBulk('admin-1', { limit: 1 });

      expect(result.attempted).toBe(1);
      expect(result.replayed).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.skipped).toBe(1);
      expect(result.details[0]).toEqual(
        expect.objectContaining({
          id: '1',
          status: 'skipped',
          reason: 'duplicate_replay_suppressed',
        }),
      );
      expect(queuedJob.retry).not.toHaveBeenCalled();
    });
  });

  describe('autoReplayDlq', () => {
    it('calls replayDlqJobsBulk with bounded parameters', async () => {
      const replaySpy = jest
        .spyOn(service as any, 'replayDlqJobsBulk')
        .mockResolvedValue({
          attempted: 0,
          replayed: 0,
          skipped: 0,
          failed: 0,
          details: [],
        });

      await (service as any).autoReplayDlq();

      expect(replaySpy).toHaveBeenCalledWith(
        'system',
        expect.objectContaining({
          limit: 50,
          reason: 'auto',
          failedAfter: expect.any(String),
        }),
      );
    });
  });
});
