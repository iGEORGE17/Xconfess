import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { AnonymousUser } from './entities/anonymous-user.entity';
import { UserAnonymousUser } from './entities/user-anonymous-link.entity';

@Injectable()
export class AnonymousUserService {
  constructor(
    @InjectRepository(AnonymousUser)
    private anonymousUserRepository: Repository<AnonymousUser>,
    @InjectRepository(UserAnonymousUser)
    private readonly userAnonRepo: Repository<UserAnonymousUser>,
  ) {}

  async create(): Promise<AnonymousUser> {
    const anon = this.anonymousUserRepository.create();
    return this.anonymousUserRepository.save(anon);
  }

  async getOrCreateForUserSession(userId: number): Promise<AnonymousUser> {
    // For demo: always create a new one. In production, check for existing within 24h.
    const anon = await this.create();
    await this.userAnonRepo.save(
      this.userAnonRepo.create({
        userId,
        anonymousUserId: anon.id,
      }),
    );
    return anon;
  }

  async findById(id: string): Promise<AnonymousUser | null> {
    return this.anonymousUserRepository.findOne({ where: { id } });
  }
}
