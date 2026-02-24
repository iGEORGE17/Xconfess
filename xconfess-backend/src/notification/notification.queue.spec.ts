import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { NotificationQueue } from './notification.queue';
import { AppLogger } from '../logger/logger.service';
import { AuditLogService } from '../audit-log/audit-log.service';

jest.mock('bullmq', () => {
  return {
    Queue: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      close: jest.fn(),
      getJobCounts: jest.fn().mockResolvedValue({
        waiting: 0,
        active: 0,
        delayed: 0,
        failed: 0,
        completed: 0,
      }),
      getFailedCount: jest.fn().mockResolvedValue(0),
      getJobs: jest.fn().mockResolvedValue([]),
      getJob: jest.fn().mockResolvedValue(null),
    })),
    Worker: jest.fn().mockImplementation(() => ({
      on: onWorkerMock,
      close: closeWorkerMock,
    })),
  };
});

describe('NotificationQueue', () => {
  let service: NotificationQueue;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue: any) => {
      if (key === 'REDIS_HOST') return 'localhost';
      if (key === 'REDIS_PORT') return 6379;
      return defaultValue;
    }),
  };

  const mockEmailService = {
    sendCommentNotification: jest.fn(),
  };

  const mockAppLogger = {
    incrementCounter: jest.fn(),
    setGauge: jest.fn(),
    observeTimer: jest.fn(),
    getMetricsSnapshot: jest.fn().mockReturnValue({
      counters: [],
      gauges: [],
      timers: [],
    }),
  };

  const mockAuditLogService = {
    logNotificationDlqReplay: jest.fn(),
  };

  const mockConfession: any = {
    id: '123',
    message: 'Test confession',
    created_at: new Date(),
  };

  const mockComment: any = {
    id: 1,
    content: 'Test comment',
    createdAt: new Date(),
    confession: mockConfession,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationQueue,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: AppLogger,
          useValue: mockAppLogger,
        },
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
      ],
    }).compile();

    service = module.get<NotificationQueue>(NotificationQueue);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('should enqueue a comment notification', async () => {
    await service.enqueueCommentNotification({
      confession: { id: 'conf-1' } as any,
      comment: { id: 1, content: 'hello there' } as any,
      recipientUserId: 42,
    });

    expect(addMock).toHaveBeenCalledWith(
      'comment-notification',
      expect.objectContaining({
        recipientUserId: 42,
      }),
      expect.objectContaining({
        attempts: 3,
      }),
    );
  });

  it('should process and send comment notifications when recipient is resolvable', async () => {
    mockRecipientResolver.resolveRecipient.mockResolvedValue({
      email: 'test@example.com',
      canNotify: true,
    });

    await (service as any).processCommentNotification({
      confession: { id: 'conf-1' },
      comment: { id: 1, content: 'A comment content for preview' },
      recipientUserId: 42,
    });

    expect(mockEmailService.sendCommentNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        confessionId: 'conf-1',
      }),
    );
  });
}); 
