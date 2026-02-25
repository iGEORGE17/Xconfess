import { Test, TestingModule } from '@nestjs/testing';
import { ConfessionService } from './confession.service';
import { AnonymousConfessionRepository } from './repository/confession.repository';
import { SearchConfessionDto } from './dto/search-confession.dto';
import { ConfessionViewCacheService } from './confession-view-cache.service';
import { AiModerationService } from '../moderation/ai-moderation.service';
import { ModerationRepositoryService } from '../moderation/moderation-repository.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('ConfessionService - Search Functionality', () => {
  let service: ConfessionService;
  let repository: AnonymousConfessionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfessionService,
        {
          provide: AnonymousConfessionRepository,
          useValue: {
            hybridSearch: jest.fn(),
            fullTextSearch: jest.fn(),
            findOne: jest.fn(),
            increment: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ConfessionViewCacheService,
          useValue: { checkAndMarkView: jest.fn() },
        },
        {
          provide: AiModerationService,
          useValue: { moderateContent: jest.fn() },
        },
        {
          provide: ModerationRepositoryService,
          useValue: { createLog: jest.fn() },
        },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<ConfessionService>(ConfessionService);
    repository = module.get<AnonymousConfessionRepository>(
      AnonymousConfessionRepository,
    );
  });

  describe('search', () => {
    it('should return search results with metadata', async () => {
      const searchDto: SearchConfessionDto = { q: 'love', page: 1, limit: 10 };
      const mockResult = {
        confessions: [
          {
            id: '1',
            message: 'I love programming',
            created_at: new Date(),
            reactions: [],
          },
        ],
        total: 1,
      };

      jest
        .spyOn(repository, 'hybridSearch')
        .mockResolvedValue(mockResult as any);

      const result = await service.search(searchDto);

      expect(result.data).toEqual(mockResult.confessions);
      expect(result.meta.total).toBe(1);
      expect(result.meta.searchTerm).toBe('love');
    });

    it('should handle empty search terms', async () => {
      const searchDto: SearchConfessionDto = { q: '', page: 1, limit: 10 };

      await expect(service.search(searchDto)).rejects.toThrow(
        'Search term cannot be empty',
      );
    });

    it('should trim search terms', async () => {
      const searchDto: SearchConfessionDto = {
        q: '  love  ',
        page: 1,
        limit: 10,
      };
      const mockResult = { confessions: [], total: 0 };

      jest
        .spyOn(repository, 'hybridSearch')
        .mockResolvedValue(mockResult as any);

      await service.search(searchDto);

      expect(repository.hybridSearch).toHaveBeenCalledWith('love', 1, 10);
    });
  });

  describe('fullTextSearch', () => {
    it('should perform full-text search', async () => {
      const searchDto: SearchConfessionDto = {
        q: 'relationship advice',
        page: 1,
        limit: 10,
      };
      const mockResult = {
        confessions: [
          {
            id: '1',
            message: 'Need relationship advice',
            created_at: new Date(),
            reactions: [],
          },
        ],
        total: 1,
      };

      jest
        .spyOn(repository, 'fullTextSearch')
        .mockResolvedValue(mockResult as any);

      const result = await service.fullTextSearch(searchDto);

      expect(result.data).toEqual(mockResult.confessions);
      expect(result.meta.searchType).toBe('fulltext');
    });

    it('should sanitize and search punctuation-heavy queries', async () => {
      const searchDto: SearchConfessionDto = {
        q: '!!!love???',
        page: 1,
        limit: 10,
      };
      const mockResult = { confessions: [], total: 0 };
      jest
        .spyOn(repository, 'fullTextSearch')
        .mockResolvedValue(mockResult as any);
      await service.fullTextSearch(searchDto);
      // Should call with sanitized term ("love")
      expect(repository.fullTextSearch).toHaveBeenCalledWith(
        '!!!love???',
        1,
        10,
      );
    });

    it('should handle missing search_vector schema gracefully', async () => {
      const searchDto: SearchConfessionDto = { q: 'test', page: 1, limit: 10 };
      // Simulate schema missing: repo returns empty
      jest
        .spyOn(repository, 'fullTextSearch')
        .mockResolvedValue({ confessions: [], total: 0 });
      const result = await service.fullTextSearch(searchDto);
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });
});
