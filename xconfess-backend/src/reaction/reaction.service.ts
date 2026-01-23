import { Inject, Injectable, Logger, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { Reaction } from './entities/reaction.entity';
import { EmailService } from '../email/email.service';
import { User } from '../user/entities/user.entity';
import { AnonymousUser } from '../user/entities/anonymous-user.entity';

@Injectable()
export class ReactionService {
  private readonly logger = new Logger(ReactionService.name);

  constructor(
    @InjectRepository(Reaction)
    private reactionRepo: Repository<Reaction>,
    @InjectRepository(AnonymousConfession)
    private confessionRepo: Repository<AnonymousConfession>,
    @Inject(forwardRef(() => EmailService))
    private emailService: EmailService,
  ) {}

  async createReaction(dto: CreateReactionDto, userId?: number): Promise<Reaction> {
    const confession = await this.confessionRepo.findOne({ 
      where: { id: dto.confessionId },
      relations: ['anonymousUser']
    });

    if (!confession) {
      throw new NotFoundException('Confession not found');
    }

    const anonymousUser = await this.confessionRepo.manager.findOne(AnonymousUser, { where: { id: confession.anonymousUser.id } });
    if (!anonymousUser) {
      throw new NotFoundException('Anonymous user not found');
    }

    // Create the reaction
    const reaction = this.reactionRepo.create({
      emoji: dto.emoji,
      confession,
      anonymousUser,
    });

    const savedReaction = await this.reactionRepo.save(reaction);

    void userId;
    void this.emailService;

    return savedReaction;
  }
}
