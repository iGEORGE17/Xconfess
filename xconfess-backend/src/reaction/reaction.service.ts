import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { AnonymousConfession } from 'src/confession/entities/confession.entity';
import { Reaction } from './entities/reaction.entity';

@Injectable()
export class ReactionService {
  constructor(
    @InjectRepository(Reaction)
    private reactionRepo: Repository<Reaction>,
    @InjectRepository(AnonymousConfession)
    private confessionRepo: Repository<AnonymousConfession>,
  ) {}

  async createReaction(dto: CreateReactionDto): Promise<Reaction> {
    const confession = await this.confessionRepo.findOne({ where: { id: dto.confessionId } });

    if (!confession) {
      throw new NotFoundException('Confession not found');
    }

    const reaction = this.reactionRepo.create({
      emoji: dto.emoji,
      confession,
    });

    return this.reactionRepo.save(reaction);
  }
}
