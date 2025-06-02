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
      relations: ['reactions']
    });
  }

  /**
   * Find confessions by a search term in the message.
   * @param searchTerm The term to search for in confession messages
   * @returns Array of confessions matching the search term
   */
  async findBySearchTerm(searchTerm: string): Promise<AnonymousConfession[]> {
    return this.find({
      where: {
        message: ILike(`%${searchTerm}%`)
      },
      order: {
        created_at: 'DESC'
      },
      relations: ['reactions']
    });
  }

  /**
   * Find recent confessions with pagination.
   * @param page The page number (1-based)
   * @param limit The number of items per page
   * @returns Array of confessions for the specified page
   */
  async findRecent(page: number = 1, limit: number = 10): Promise<AnonymousConfession[]> {
    return this.find({
      order: {
        created_at: 'DESC'
      },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['reactions']
    });
  }

  /**
   * Count total number of confessions.
   * @returns The total count of confessions
   */
  async countTotal(): Promise<number> {
    return this.count();
  }
}
