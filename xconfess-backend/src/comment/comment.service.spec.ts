import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { NotificationQueue } from '../notification/notification.queue';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ModerationComment, ModerationStatus } from './entities/moderation-comment.entity';

describe('CommentService (soft‑delete)', () => {
  let service: CommentService;
  let commentRepo: jest.Mocked<Repository<Comment>>;
  let confessionRepo: jest.Mocked<Repository<AnonymousConfession>>;
  let queue: jest.Mocked<NotificationQueue>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AnonymousConfession),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: NotificationQueue,
          useValue: { enqueueCommentNotification: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(CommentService);
    commentRepo = module.get(getRepositoryToken(Comment));
    confessionRepo = module.get(getRepositoryToken(AnonymousConfession));
    queue = module.get(NotificationQueue);
  });

  describe(`findByConfessionId()`, () => {
    it(`calls find() with isDeleted: false`, async () => {
      commentRepo.find.mockResolvedValue([]);
      await service.findByConfessionId('conf1');
      expect(commentRepo.find).toHaveBeenCalledWith({
        where: { confession: { id: 'conf1' }, isDeleted: false },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe(`delete()`, () => {
    const fakeUser = { id: 11 } as any;
    const goodComment = {
      id: 42,
      user: { id: 11 },
      isDeleted: false,
    } as any;

    it(`sets isDeleted to true when user owns it`, async () => {
      commentRepo.findOne.mockResolvedValue(goodComment);
      (commentRepo.update as jest.Mock).mockResolvedValue({ affected: 1 } as UpdateResult);

      await expect(service.delete(42, fakeUser)).resolves.toBeUndefined();
      expect(commentRepo.update).toHaveBeenCalledWith(42, { isDeleted: true });
    });

    it(`throws NotFoundException if comment not found`, async () => {
      commentRepo.findOne.mockResolvedValue(null);
      await expect(service.delete(99, fakeUser)).rejects.toThrow(NotFoundException);
    });

    it(`throws BadRequestException if user doesn’t own comment`, async () => {
      commentRepo.findOne.mockResolvedValue({ id: 42, user: { id: 77 }, isDeleted: false } as any);
      await expect(service.delete(42, fakeUser)).rejects.toThrow(BadRequestException);
    });
  });

  describe(`create()`, () => {
    const fakeUser = { id: 5 } as any;
    const fakeConf = { id: 'c1', user: { email: 'a@b.com' }, isDeleted: false } as any;
    const fakeComment = { id: 101, content: 'hey', user: fakeUser, confession: fakeConf } as any;

    it(`throws if confession not found or deleted`, async () => {
      confessionRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create('hey', fakeUser, 'c1', 'anonCtx'),
      ).rejects.toThrow(NotFoundException);

      confessionRepo.findOne.mockResolvedValue({ ...fakeConf, isDeleted: true });
      await expect(
        service.create('hey', fakeUser, 'c1', 'anonCtx'),
      ).rejects.toThrow(NotFoundException);
    });

    it(`creates, saves, and enqueues notification`, async () => {
      confessionRepo.findOne.mockResolvedValue(fakeConf);
      commentRepo.create.mockReturnValue(fakeComment);
      commentRepo.save.mockResolvedValue(fakeComment);

      const result = await service.create('hey', fakeUser, 'c1', 'anonCtx');
      expect(commentRepo.create).toHaveBeenCalledWith({
        content: 'hey',
        user: fakeUser,
        confession: fakeConf,
        anonymousContextId: 'anonCtx',
      });
      expect(commentRepo.save).toHaveBeenCalledWith(fakeComment);
      expect(queue.enqueueCommentNotification).toHaveBeenCalledWith({
        confession: fakeConf,
        comment: fakeComment,
        recipientEmail: 'a@b.com',
      });
      expect(result).toBe(fakeComment);
    });
  });
});

describe('CommentService (moderation)', () => {
  let service: CommentService;
  let moderationRepo: jest.Mocked<Repository<ModerationComment>>;
  let commentRepo: jest.Mocked<Repository<Comment>>;
  let confessionRepo: jest.Mocked<Repository<AnonymousConfession>>;
  let queue: jest.Mocked<NotificationQueue>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn(), update: jest.fn() },
        },
        {
          provide: getRepositoryToken(AnonymousConfession),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(ModerationComment),
          useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() },
        },
        { provide: NotificationQueue, useValue: { enqueueCommentNotification: jest.fn() } },
      ],
    }).compile();

    service = module.get(CommentService);
    moderationRepo = module.get(getRepositoryToken(ModerationComment));
    commentRepo = module.get(getRepositoryToken(Comment));
    confessionRepo = module.get(getRepositoryToken(AnonymousConfession));
    queue = module.get(NotificationQueue);
  });

  describe('moderateComment()', () => {
    const moderator = { id: 1 } as any;
    const comment = { id: 10 } as any;
    it('approves a pending comment', async () => {
      const moderation = { comment, status: ModerationStatus.PENDING, save: jest.fn() } as any;
      moderationRepo.findOne.mockResolvedValue(moderation);
      moderationRepo.save.mockResolvedValue({ ...moderation, status: ModerationStatus.APPROVED });
      const result = await service.moderateComment(10, ModerationStatus.APPROVED, moderator);
      expect(result.success).toBe(true);
      expect(moderationRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: ModerationStatus.APPROVED, moderatedBy: moderator }));
    });
    it('rejects a pending comment', async () => {
      const moderation = { comment, status: ModerationStatus.PENDING, save: jest.fn() } as any;
      moderationRepo.findOne.mockResolvedValue(moderation);
      moderationRepo.save.mockResolvedValue({ ...moderation, status: ModerationStatus.REJECTED });
      const result = await service.moderateComment(10, ModerationStatus.REJECTED, moderator);
      expect(result.success).toBe(true);
      expect(moderationRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: ModerationStatus.REJECTED, moderatedBy: moderator }));
    });
    it('throws if moderation entry not found', async () => {
      moderationRepo.findOne.mockResolvedValue(null);
      await expect(service.moderateComment(99, ModerationStatus.APPROVED, moderator)).rejects.toThrow();
    });
    it('throws if already moderated', async () => {
      const moderation = { comment, status: ModerationStatus.APPROVED } as any;
      moderationRepo.findOne.mockResolvedValue(moderation);
      await expect(service.moderateComment(10, ModerationStatus.REJECTED, moderator)).rejects.toThrow();
    });
  });

  describe('create() moderation entry', () => {
    it('creates a moderation entry when a comment is created', async () => {
      const confession = { id: 'c1', anonymousUser: { id: 'anon1' } } as any;
      const comment = { id: 101, content: 'hey', anonymousUser: { id: 'anon1' }, confession } as any;
      confessionRepo.findOne.mockResolvedValue(confession);
      commentRepo.create.mockReturnValue(comment);
      commentRepo.save.mockResolvedValue(comment);
      const moderationObj = { id: 1, comment, commentId: comment.id, status: ModerationStatus.PENDING, createdAt: new Date() } as ModerationComment;
      moderationRepo.create.mockReturnValue(moderationObj);
      moderationRepo.save.mockResolvedValue(moderationObj);
      await service.create('hey', { id: 'anon1' } as any, 'c1', 'anonCtx');
      expect(moderationRepo.create).toHaveBeenCalledWith(expect.objectContaining({ comment, status: ModerationStatus.PENDING, commentId: comment.id }));
      expect(moderationRepo.save).toHaveBeenCalled();
    });
  });
});
