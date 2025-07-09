import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { NotificationQueue } from '../notification/notification.queue';
import { NotFoundException, BadRequestException } from '@nestjs/common';

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
