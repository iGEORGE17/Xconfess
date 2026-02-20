// ...existing code...
import { DataSource, Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AnonymousConfession } from '../entities/confession.entity';

/**
 * Repository for handling database operations related to anonymous confessions.
 * Extends TypeORM's Repository to provide additional functionality.
 */
@Injectable()
export class AnonymousConfessionRepository extends Repository<AnonymousConfession> {
  constructor(private dataSource: DataSource) {
    super(AnonymousConfession, dataSource.createEntityManager());
  }

  /**
   * Find a confession by its ID with its reactions.
   * @param id The UUID of the confession
   * @returns The confession with its reactions, or null if not found
   */
  async findByIdWithReactions(id: string): Promise<AnonymousConfession | null> {
    return this.findOne({
      where: { id },
      relations: ['reactions'],
    });
  }

  /**
   * Find confessions by a search term in the message using basic ILIKE.
   * @param searchTerm The term to search for in confession messages
   * @returns Array of confessions matching the search term
   */
  async findBySearchTerm(searchTerm: string): Promise<AnonymousConfession[]> {
    return this.find({
      where: {
        message: ILike(`%${searchTerm}%`),
      },
      order: {
        created_at: 'DESC',
      },
      relations: ['reactions'],
    });
  }

  /**
   * Full-text search confessions using PostgreSQL's tsvector and ts_rank.
   * @param searchTerm The search query
   * @param page Page number for pagination
   * @param limit Number of results per page
   * @returns Array of confessions ranked by relevance
   */
  async fullTextSearch(
    searchTerm: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    confessions: AnonymousConfession[];
    total: number;
  }> {
    const safeLimit = typeof limit === 'number' ? limit : 10;
    const offset = (page - 1) * safeLimit;

    // Sanitize search term for tsquery
    const sanitizedTerm = searchTerm
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .trim()
      .split(/\s+/)
      .filter((term) => term.length > 0)
      .join(' & '); // Join with AND operator

    if (!sanitizedTerm) {
      return { confessions: [], total: 0 };
    }

    // Build the query with ts_rank for relevance scoring
    const queryBuilder = this.createQueryBuilder('confession')
      .leftJoinAndSelect('confession.reactions', 'reactions')
      .where('confession.search_vector @@ plainto_tsquery(:searchTerm)', {
        searchTerm,
      })
      .addSelect(
        'ts_rank(confession.search_vector, plainto_tsquery(:searchTerm))',
        'rank',
      )
      .orderBy('rank', 'DESC')
      .addOrderBy('confession.created_at', 'DESC')
      .skip(offset)
      .take(limit);

    // Get total count for pagination
    const totalQuery = this.createQueryBuilder('confession').where(
      'confession.search_vector @@ plainto_tsquery(:searchTerm)',
      { searchTerm },
    );

    const [confessions, total] = await Promise.all([
      queryBuilder.getMany(),
      totalQuery.getCount(),
    ]);

    return { confessions, total };
  }

  /**
   * Hybrid search that combines full-text search with fallback to ILIKE.
   * @param searchTerm The search query
   * @param page Page number for pagination
   * @param limit Number of results per page
   * @returns Array of confessions with relevance ranking
   */
  async hybridSearch(
    searchTerm: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    confessions: AnonymousConfession[];
    total: number;
  }> {
    // First try full-text search
    const safeLimit = typeof limit === 'number' ? limit : 10;
    const fullTextResult = await this.fullTextSearch(
      searchTerm,
      page,
      safeLimit,
    );

    // If full-text search returns results, use them
    if (fullTextResult.total > 0) {
      return fullTextResult;
    }

    // Fallback to ILIKE search for partial matches
    const offset = (page - 1) * safeLimit;

    const queryBuilder = this.createQueryBuilder('confession')
      .leftJoinAndSelect('confession.reactions', 'reactions')
      .where('confession.message ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .orderBy('confession.created_at', 'DESC')
      .skip(offset)
      .take(safeLimit);

    const totalQuery = this.createQueryBuilder('confession').where(
      'confession.message ILIKE :searchTerm',
      { searchTerm: `%${searchTerm}%` },
    );

    const [confessions, total] = await Promise.all([
      queryBuilder.getMany(),
      totalQuery.getCount(),
    ]);

    return { confessions, total };
  }

  /**
   * Find recent confessions with pagination.
   * @param page The page number (1-based)
   * @param limit The number of items per page
   * @returns Array of confessions for the specified page
   */
  async findRecent(
    page: number = 1,
    limit: number = 10,
  ): Promise<AnonymousConfession[]> {
    return this.find({
      order: {
        created_at: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['reactions'],
    });
  }

  /**
   * Count total number of confessions.
   * @returns The total count of confessions
   */
  async countTotal(): Promise<number> {
    return this.count();
  }

  /**
   * Atomically increment the view count of a confession.
   * @param id The UUID of the confession
   */
  async incrementViewCountAtomically(id: string): Promise<void> {
    const result = await this.increment({ id }, 'view_count', 1);
    if (result.affected === 0) {
      throw new Error(`Confession with ID ${id} not found`);
    }
  }

  /**
   * Fetch top trending confessions based on view count, recent reactions, and recency.
   * Trending score = view_count * 1 + recent_reactions * 3 + 10 / (1 + hours_since_created)
   * Only considers reactions in the last 24 hours.
   */
  async findTrending(limit: number = 10): Promise<AnonymousConfession[]> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Use raw SQL for performance and flexibility
    return this.createQueryBuilder('confession')
      .leftJoinAndSelect('confession.reactions', 'reactions')
      .addSelect(
        `confession.view_count + 3 * COUNT(CASE WHEN reactions.createdAt > :oneDayAgo THEN 1 END) + 10.0 / (1 + EXTRACT(EPOCH FROM (NOW() - confession.created_at)) / 3600)`,
        'trending_score',
      )
      .where('confession.created_at IS NOT NULL')
      .groupBy('confession.id')
      .orderBy('trending_score', 'DESC')
      .limit(limit)
      .setParameter('oneDayAgo', oneDayAgo.toISOString())
      .getMany();
  }

  /**
   * Find confessions by tag with pagination
   * @param tagName The name of the tag to filter by
   * @param page Page number for pagination
   * @param limit Number of results per page
   * @returns Object containing confessions and total count
   */
  async findByTag(
    tagName: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    confessions: AnonymousConfession[];
    total: number;
  }> {
    const safeLimit = typeof limit === 'number' ? limit : 10;
    const offset = (page - 1) * safeLimit;

    const queryBuilder = this.createQueryBuilder('confession')
      .innerJoin('confession.confessionTags', 'confessionTag')
      .innerJoin('confessionTag.tag', 'tag')
      .leftJoinAndSelect('confession.reactions', 'reactions')
      .leftJoinAndSelect('reactions.anonymousUser', 'reactionUser')
      .where('tag.name = :tagName', { tagName: tagName.toLowerCase().trim() })
      .andWhere('confession.isDeleted = false')
      .andWhere('confession.isHidden = false')
      .andWhere('confession.moderationStatus IN (:...statuses)', {
        statuses: ['approved', 'pending'],
      })
      .select([
        'confession.id',
        'confession.message',
        'confession.gender',
        'confession.created_at',
        'confession.view_count',
        'confession.moderationStatus',
        'reactions.id',
        'reactions.emoji',
        'reactions.created_at',
        'reactionUser.id',
      ])
      .orderBy('confession.created_at', 'DESC')
      .skip(offset)
      .take(safeLimit);

    const totalQuery = this.createQueryBuilder('confession')
      .innerJoin('confession.confessionTags', 'confessionTag')
      .innerJoin('confessionTag.tag', 'tag')
      .where('tag.name = :tagName', { tagName: tagName.toLowerCase().trim() })
      .andWhere('confession.isDeleted = false')
      .andWhere('confession.isHidden = false')
      .andWhere('confession.moderationStatus IN (:...statuses)', {
        statuses: ['approved', 'pending'],
      });

    const [confessions, total] = await Promise.all([
      queryBuilder.getMany(),
      totalQuery.getCount(),
    ]);

    return { confessions, total };
  }
}
