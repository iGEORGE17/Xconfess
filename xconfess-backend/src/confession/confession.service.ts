import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { AnonymousConfessionRepository } from "./repository/confession.repository";
import { CreateConfessionDto } from "./dto/create-confession.dto";
import { UpdateConfessionDto } from "./dto/update-confession.dto";
import { SearchConfessionDto } from "./dto/search-confession.dto";
import { GetConfessionsDto, SortOrder } from "./dto/get-confessions.dto";
import { ILike } from "typeorm";
import sanitizeHtml from 'sanitize-html';
import { ConfessionViewCacheService } from './confession-view-cache.service';
import { Request } from 'express';

@Injectable()
export class ConfessionService {
  constructor(
    private confessionRepo: AnonymousConfessionRepository,
    private viewCache: ConfessionViewCacheService
  ) {}

  private sanitizeMessage(message: string): string {
    return sanitizeHtml(message, {
      allowedTags: [], // No HTML tags allowed
      allowedAttributes: {}, // No attributes allowed
      disallowedTagsMode: 'recursiveEscape'
    }).trim();
  }

  async create(createConfessionDto: CreateConfessionDto) {
    try {
      const { message } = createConfessionDto;
      const sanitizedMessage = this.sanitizeMessage(message);
      
      if (!sanitizedMessage) {
        throw new BadRequestException('Invalid confession content');
      }

      const confession = this.confessionRepo.create({ message: sanitizedMessage });
      return await this.confessionRepo.save(confession);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create confession');
    }
  }

  async getConfessions(getConfessionsDto: GetConfessionsDto) {
    try {
      const { page = 1, limit = 10, sort = SortOrder.NEWEST, gender } = getConfessionsDto;
      const skip = (page - 1) * limit;

      const queryBuilder = this.confessionRepo.createQueryBuilder('confession')
        .leftJoinAndSelect('confession.reactions', 'reactions');

      // Apply gender filter if provided
      if (gender) {
        queryBuilder.andWhere('confession.gender = :gender', { gender });
      }

      // Apply sorting
      if (sort === SortOrder.TRENDING) {
        queryBuilder
          .addSelect((subQuery) => {
            return subQuery
              .select('COUNT(*)', 'reaction_count')
              .from('reaction', 'r')
              .where('r.confession_id = confession.id');
          }, 'reaction_count')
          .orderBy('reaction_count', 'DESC')
          .addOrderBy('confession.created_at', 'DESC');
      } else {
        queryBuilder.orderBy('confession.created_at', 'DESC');
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      queryBuilder.skip(skip).take(limit);

      // Execute query
      const confessions = await queryBuilder.getMany();

      return {
        data: confessions,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch confessions');
    }
  }

  async update(id: string, updateConfessionDto: UpdateConfessionDto) {
    try {
      // First check if the confession exists
      const confession = await this.confessionRepo.findOne({ where: { id } });
      if (!confession) {
        throw new NotFoundException(`Confession with ID ${id} not found`);
      }

      if (updateConfessionDto.message) {
        updateConfessionDto.message = this.sanitizeMessage(updateConfessionDto.message);
        if (!updateConfessionDto.message) {
          throw new BadRequestException('Invalid confession content');
        }
      }

      await this.confessionRepo.update(id, updateConfessionDto);
      return await this.confessionRepo.findOne({ where: { id } });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update confession');
    }
  }
  
  async remove(id: string) {
    try {
      // First check if the confession exists
      const confession = await this.confessionRepo.findOne({ where: { id } });
      if (!confession) {
        throw new NotFoundException(`Confession with ID ${id} not found`);
      }

      await this.confessionRepo.delete(id);
      return { message: 'Confession successfully deleted' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete confession');
    }
  }

  async search(searchDto: SearchConfessionDto) {
    try {
      const { q: searchTerm, page = 1, limit = 10 } = searchDto;
      
      // Validate search term
      if (!searchTerm || searchTerm.trim().length === 0) {
        throw new BadRequestException('Search term cannot be empty');
      }

      // Use hybrid search for better results
      const result = await this.confessionRepo.hybridSearch(searchTerm.trim(), page, limit);

      return {
        data: result.confessions,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
          searchTerm: searchTerm.trim()
        }
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to search confessions');
    }
  }

  /**
   * Advanced search with full-text search capabilities
   */
  async fullTextSearch(searchDto: SearchConfessionDto) {
    try {
      const { q: searchTerm, page = 1, limit = 10 } = searchDto;
      
      if (!searchTerm || searchTerm.trim().length === 0) {
        throw new BadRequestException('Search term cannot be empty');
      }

      const result = await this.confessionRepo.fullTextSearch(searchTerm.trim(), page, limit);

      return {
        data: result.confessions,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
          searchTerm: searchTerm.trim(),
          searchType: 'fulltext'
        }
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to perform full-text search');
    }
  }

   async getConfessionByIdWithViewCount(id: string, req: Request) {
    try {
      const confession = await this.confessionRepo.findOne({ where: { id } });
      if (!confession) throw new NotFoundException('Confession not found');
      
      // Properly type the user property and handle IP with forwarded headers
      interface AuthenticatedRequest extends Request {
        user?: { id: string };
      }
      const authReq = req as AuthenticatedRequest;
      const userOrIp = authReq.user?.id || req.headers['x-forwarded-for'] || req.ip;
      
      // Atomically check and mark view to prevent race conditions
      const shouldIncrement = await this.viewCache.checkAndMarkView(id, userOrIp);
      if (shouldIncrement) {
        await this.confessionRepo.incrementViewCountAtomically(id);
        // Re-fetch to get accurate view count instead of local increment
        const updatedConfession = await this.confessionRepo.findOne({ where: { id } });
        return updatedConfession || confession;
      }
      return confession;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get confession with view count');
    }
  }

  /**
   * Get the top 10 trending confessions based on view count, recent reactions, and recency.
   */
  async getTrendingConfessions() {
    try {
      const confessions = await this.confessionRepo.findTrending(10);
      return { data: confessions };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch trending confessions');
    }
  }
}
