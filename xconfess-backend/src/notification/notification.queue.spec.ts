import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { NotificationQueue } from './notification.queue';
import { RecipientResolver } from './recipient-resolver.service';

const addMock = jest.fn();
const closeQueueMock = jest.fn();
const closeWorkerMock = jest.fn();
const onWorkerMock = jest.fn();

jest.mock('bullmq', () => {
  return {
    Queue: jest.fn().mockImplementation(() => ({
      add: addMock,
      close: closeQueueMock,
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

  const mockRecipientResolver = {
    resolveRecipient: jest.fn(),
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
          provide: RecipientResolver,
          useValue: mockRecipientResolver,
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
