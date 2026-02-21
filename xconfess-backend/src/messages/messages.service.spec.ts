import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { Message } from './entities/message.entity';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { UserAnonymousUser } from '../user/entities/user-anonymous-link.entity';
import { AnonymousUserService } from '../user/anonymous-user.service';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { User } from '../user/entities/user.entity';

describe('MessagesService', () => {
  let service: MessagesService;
  let messageRepo: Repository<Message>;
  let confessionRepo: Repository<AnonymousConfession>;
  let userAnonRepo: Repository<UserAnonymousUser>;
  let anonUserService: AnonymousUserService;

  const mockUser: User = { id: 1 } as User;
  const mockAnonId = 'anon-123';
  const mockConfessionId = 'conf-123';
  const mockSenderId = 'sender-456';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getRepositoryToken(Message),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            manager: {
              transaction: jest.fn(),
            },
          },
        },
        {
          provide: getRepositoryToken(AnonymousConfession),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserAnonymousUser),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: AnonymousUserService,
          useValue: {
            getOrCreateForUserSession: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    messageRepo = module.get<Repository<Message>>(getRepositoryToken(Message));
    confessionRepo = module.get<Repository<AnonymousConfession>>(
      getRepositoryToken(AnonymousConfession),
    );
    userAnonRepo = module.get<Repository<UserAnonymousUser>>(
      getRepositoryToken(UserAnonymousUser),
    );
    anonUserService = module.get<AnonymousUserService>(AnonymousUserService);
  });

  describe('findForConfessionThread', () => {
    it('should return messages if user is author', async () => {
      const confession = { 
        id: mockConfessionId, 
        anonymousUser: { id: mockAnonId } 
      };
      jest.spyOn(confessionRepo, 'findOne').mockResolvedValue(confession as any);
      jest.spyOn(userAnonRepo, 'find').mockResolvedValue([{ anonymousUserId: mockAnonId }] as any);
      
      const mockMessages = [{ id: 1, content: 'test' }];
      jest.spyOn(messageRepo, 'find').mockResolvedValue(mockMessages as any);

      const result = await service.findForConfessionThread(mockConfessionId, mockSenderId, mockUser);
      expect(result).toEqual(mockMessages);
      expect(messageRepo.find).toHaveBeenCalledWith({
        where: { confession: { id: mockConfessionId }, sender: { id: mockSenderId } },
        order: { createdAt: 'ASC' },
      });
    });

    it('should return messages if user is sender', async () => {
      const confession = { 
        id: mockConfessionId, 
        anonymousUser: { id: 'other-anon' } 
      };
      jest.spyOn(confessionRepo, 'findOne').mockResolvedValue(confession as any);
      jest.spyOn(userAnonRepo, 'find').mockResolvedValue([{ anonymousUserId: mockSenderId }] as any);
      
      const mockMessages = [{ id: 1, content: 'test' }];
      jest.spyOn(messageRepo, 'find').mockResolvedValue(mockMessages as any);

      const result = await service.findForConfessionThread(mockConfessionId, mockSenderId, mockUser);
      expect(result).toEqual(mockMessages);
    });

    it('should throw ForbiddenException if user is neither author nor sender', async () => {
      const confession = { 
        id: mockConfessionId, 
        anonymousUser: { id: 'other-anon' } 
      };
      jest.spyOn(confessionRepo, 'findOne').mockResolvedValue(confession as any);
      jest.spyOn(userAnonRepo, 'find').mockResolvedValue([{ anonymousUserId: 'unrelated-anon' }] as any);

      await expect(service.findForConfessionThread(mockConfessionId, mockSenderId, mockUser))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllThreadsForUser', () => {
    it('should return grouped threads', async () => {
      jest.spyOn(userAnonRepo, 'find').mockResolvedValue([{ anonymousUserId: mockAnonId }] as any);
      
      const mockMessages = [
        {
          confession: { id: 'c1', message: 'Confession 1', anonymousUser: { id: 'author1' } },
          sender: { id: 's1' },
          content: 'msg1',
          createdAt: new Date(),
        },
        {
          confession: { id: 'c1', message: 'Confession 1', anonymousUser: { id: 'author1' } },
          sender: { id: 's1' },
          content: 'msg2',
          createdAt: new Date(Date.now() - 1000),
        },
      ];
      jest.spyOn(messageRepo, 'find').mockResolvedValue(mockMessages as any);

      const result = await service.findAllThreadsForUser(mockUser);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        confessionId: 'c1',
        senderId: 's1',
      });
    });
  });
});
