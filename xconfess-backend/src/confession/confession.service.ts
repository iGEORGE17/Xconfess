import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AnonymousConfessionRepository } from './repository/confession.repository';
import { CreateConfessionDto } from './dto/create-confession.dto';
import { UpdateConfessionDto } from './dto/update-confession.dto';
import { SearchConfessionDto } from './dto/search-confession.dto';
import { GetConfessionsDto, SortOrder } from './dto/get-confessions.dto';
import sanitizeHtml from 'sanitize-html';
import { ConfessionViewCacheService } from './confession-view-cache.service';
import { Request } from 'express';

@Injectable()
export class ConfessionService {
  constructor(
    private confessionRepo: AnonymousConfessionRepository,
    private viewCache: ConfessionViewCacheService,
  ) {}

  private sanitizeMessage(message: string): string {
    return sanitizeHtml(message, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'recursiveEscape',
    }).trim();
  }

  async create(dto: CreateConfessionDto) {
    const msg = this.sanitizeMessage(dto.message);
    if (!msg) throw new BadRequestException('Invalid confession content');
    try {
      const conf = this.confessionRepo.create({ message: msg, gender: dto.gender });
      return await this.confessionRepo.save(conf);
    } catch {
      throw new InternalServerErrorException('Failed to create confession');
    }
  }

  async getConfessions(dto: GetConfessionsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    if (limit < 1 || limit > 100) throw new BadRequestException('limit must be 1–100');

    const skip = (page - 1) * limit;
    const qb = this.confessionRepo.createQueryBuilder('confession')
      .andWhere('confession.isDeleted = false')
      .leftJoinAndSelect('confession.reactions', 'reactions');

    if (dto.gender) {
      qb.andWhere('confession.gender = :gender', { gender: dto.gender });
    }

    if (dto.sort === SortOrder.TRENDING) {
      qb.addSelect(sub =>
        sub.select('COUNT(*)')
           .from('reaction', 'r')
           .where('r.confession_id = confession.id'),
      , 'reaction_count')
        .orderBy('reaction_count', 'DESC')
        .addOrderBy('confession.created_at', 'DESC');
    } else {
      qb.orderBy('confession.created_at', 'DESC');
    }

    const total = await qb.getCount();
    const items = await qb.skip(skip).take(limit).getMany();

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(id: string, dto: UpdateConfessionDto) {
    const existing = await this.confessionRepo.findOne({ where: { id, isDeleted: false } });
    if (!existing) throw new NotFoundException(`Confession ${id} not found`);
    if (dto.message) {
      dto.message = this.sanitizeMessage(dto.message);
      if (!dto.message) throw new BadRequestException('Invalid content');
    }
    await this.confessionRepo.update(id, dto);
    return this.confessionRepo.findOne({ where: { id } });
  }

  async remove(id: string) {
    const existing = await this.confessionRepo.findOne({ where: { id, isDeleted: false } });
    if (!existing) throw new NotFoundException(`Confession ${id} not found`);
    await this.confessionRepo.update(id, { isDeleted: true });
    return { message: 'Confession soft‑deleted' };
  }

  async search(dto: SearchConfessionDto) {
    if (!dto.q.trim()) throw new BadRequestException('Search term cannot be empty');
    const result = await this.confessionRepo.hybridSearch(dto.q.trim(), dto.page, dto.limit);
    return {
      data: result.confessions,
      meta: {
        total: result.total,
        page: dto.page,
        limit: dto.limit,
        totalPages: Math.ceil(result.total / dto.limit),
        searchTerm: dto.q.trim(),
      },
    };
  }

  async fullTextSearch(dto: SearchConfessionDto) {
    if (!dto.q.trim()) throw new BadRequestException('Search term cannot be empty');
    const result = await this.confessionRepo.fullTextSearch(dto.q.trim(), dto.page, dto.limit);
    return {
      data: result.confessions,
      meta: {
        total: result.total,
        page: dto.page,
        limit: dto.limit,
        totalPages: Math.ceil(result.total / dto.limit),
        searchTerm: dto.q.trim(),
        searchType: 'fulltext',
      },
    };
  }

  async getConfessionByIdWithViewCount(id: string, req: Request) {
    const conf = await this.confessionRepo.findOne({ where: { id, isDeleted: false } });
    if (!conf) throw new NotFoundException('Confession not found');

    const userOrIp = (req.user as any)?.id
      || req.headers['x-forwarded-for']
      || req.ip;

    if (await this.viewCache.checkAndMarkView(id, userOrIp)) {
      await this.confessionRepo.increment({ id }, 'view_count', 1);
      return this.confessionRepo.findOne({ where: { id } });
    }
    return conf;
  }

  async getTrendingConfessions() {
    const confs = await this.confessionRepo.findTrending(10);
    return { data: confs };
  }
}
