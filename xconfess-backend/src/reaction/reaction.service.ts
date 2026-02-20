import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { Reaction } from './entities/reaction.entity';
import { AnonymousUser } from '../user/entities/anonymous-user.entity';

@Injectable()
export class ReactionService {
  private readonly logger = new Logger(ReactionService.name);

  constructor(
    @InjectRepository(Reaction)
    private reactionRepo: Repository<Reaction>,
    @InjectRepository(AnonymousConfession)
    private confessionRepo: Repository<AnonymousConfession>,
    @InjectRepository(AnonymousUser)
    private anonymousUserRepo: Repository<AnonymousUser>,
  ) {}

  async createReaction(dto: CreateReactionDto): Promise<Reaction> {
    const confession = await this.confessionRepo.findOne({
      where: { id: dto.confessionId },
    });

    if (!confession) {
      throw new NotFoundException('Confession not found');
    }

    const anonymousUser = await this.anonymousUserRepo.findOne({
      where: { id: dto.anonymousUserId },
    });
    if (!anonymousUser) {
      throw new NotFoundException('Anonymous user not found');
    }

    const reaction = this.reactionRepo.create({
      emoji: dto.emoji,
      confession,
      anonymousUser,
    });

    const savedReaction = await this.reactionRepo.save(reaction);

    return savedReaction;
  }
}
