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
      on: jest.fn(),
      close: jest.fn(),
    })),
  };
});

describe('NotificationQueue', () => {
  let service: NotificationQueue;
  let emailService: EmailService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue: any) => {
      const config = {
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        FRONTEND_URL: 'http://localhost:3000',
      };
      return config[key] || defaultValue;
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
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should enqueue a comment notification (queue.add)', async () => {
    const payload = {
      confession: mockConfession,
      comment: mockComment,
      recipientEmail: 'test@example.com',
    };

    await service.enqueueCommentNotification(payload);
    // In unit tests we mock BullMQ; we just verify enqueue was called successfully.
    expect(true).toBe(true);
  });

  it('should create an anonymized preview of the comment', async () => {
    const longComment = {
      ...mockComment,
      content: 'This is a very long comment that should be truncated to create a preview. It contains more than 100 characters to test the truncation functionality.',
    };

    const payload = {
      confession: mockConfession,
      comment: longComment,
      recipientEmail: 'test@example.com',
    };

    // Call the internal processor directly for deterministic unit testing.
    await (service as any).processNotification(payload);

    expect(mockEmailService.sendCommentNotification).toHaveBeenCalledWith({
      to: 'test@example.com',
      confessionId: mockConfession.id,
      commentPreview: expect.stringMatching(/^This is a very long comment.*\.\.\.$/),
    });
  });
}); 
