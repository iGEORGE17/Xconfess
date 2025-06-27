import { Test, TestingModule } from '@nestjs/testing';
import { ConfessionService } from './confession.service';
import { AnonymousConfessionRepository } from './repository/confession.repository';
import { ConfessionViewCacheService } from './confession-view-cache.service';

describe('ConfessionService - View Count Logic', () => {
  let service: ConfessionService;
  let repo: AnonymousConfessionRepository;
  let cache: ConfessionViewCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfessionService,
        {
          provide: AnonymousConfessionRepository,
          useValue: {
            findOne: jest.fn(),
            incrementViewCountAtomically: jest.fn(),
          },
        },
        {
          provide: ConfessionViewCacheService,
          useValue: {
            hasViewedRecently: jest.fn(),
            markViewed: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConfessionService>(ConfessionService);
    repo = module.get<AnonymousConfessionRepository>(AnonymousConfessionRepository);
    cache = module.get<ConfessionViewCacheService>(ConfessionViewCacheService);
  });

  it('should increment view count if not viewed recently', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue({ id: '1', view_count: 0 });
    (cache.hasViewedRecently as jest.Mock).mockResolvedValue(false);
    (repo.incrementViewCountAtomically as jest.Mock).mockResolvedValue(undefined);
    (cache.markViewed as jest.Mock).mockResolvedValue(undefined);
    const req = { user: { id: 'user1' }, ip: '127.0.0.1' };
    const confession = await service.getConfessionByIdWithViewCount('1', req as any);
    expect(confession.view_count).toBe(1);
  });

  it('should not increment view count if viewed recently', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue({ id: '1', view_count: 5 });
    (cache.hasViewedRecently as jest.Mock).mockResolvedValue(true);
    const req = { user: { id: 'user1' }, ip: '127.0.0.1' };
    const confession = await service.getConfessionByIdWithViewCount('1', req as any);
    expect(confession.view_count).toBe(5);
  });
});
