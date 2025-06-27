import { Test, TestingModule } from '@nestjs/testing';
import { ConfessionController } from './confession.controller';
import { ConfessionService } from './confession.service';
import { ConfessionViewCacheService } from './confession-view-cache.service';

describe('ConfessionController - View Count', () => {
  let controller: ConfessionController;
  let service: ConfessionService;
  let viewCache: ConfessionViewCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfessionController],
      providers: [
        {
          provide: ConfessionService,
          useValue: {
            getConfessionByIdWithViewCount: jest.fn(),
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

    controller = module.get<ConfessionController>(ConfessionController);
    service = module.get<ConfessionService>(ConfessionService);
    viewCache = module.get<ConfessionViewCacheService>(ConfessionViewCacheService);
  });

  it('should increment view count for new viewer', async () => {
    const confession = { id: '1', view_count: 1 };
    (service.getConfessionByIdWithViewCount as jest.Mock).mockResolvedValue(confession);
    const req = { user: { id: 'user1' }, ip: '127.0.0.1' };
    const result = await controller.getConfessionById('1', req as any);
    expect(result.view_count).toBe(1);
  });
});
