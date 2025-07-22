import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { AnonymousUser } from './entities/anonymous-user.entity';

@Injectable()
export class AnonymousUserService {
  constructor(
    @InjectRepository(AnonymousUser)
    private anonymousUserRepository: Repository<AnonymousUser>,
  ) {}

  async create(): Promise<AnonymousUser> {
    const anon = this.anonymousUserRepository.create();
    return this.anonymousUserRepository.save(anon);
  }

  async getOrCreateForUserSession(userId: number): Promise<AnonymousUser> {
    // For demo: always create a new one. In production, check for existing within 24h.
    return this.create();
  }

  async findById(id: string): Promise<AnonymousUser | null> {
    return this.anonymousUserRepository.findOne({ where: { id } });
  }
}
