import { Test, TestingModule } from '@nestjs/testing';
import { ReactionService } from './reaction.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reaction } from './entities/reaction.entity';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { AnonymousUser } from '../user/entities/anonymous-user.entity';

describe('ReactionService', () => {
  let service: ReactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReactionService,
        { provide: getRepositoryToken(Reaction), useValue: { create: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(AnonymousConfession), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(AnonymousUser), useValue: { findOne: jest.fn() } },
      ],
    }).compile();

    service = module.get<ReactionService>(ReactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
