import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
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
    // 1. Verify confession exists.
    //    Do NOT load relations: ['anonymousUser'] — confession.anonymousUser
    //    is the confession's *owner*, not the reactor, and is not needed here.
    const confession = await this.confessionRepo.findOne({
      where: { id: dto.confessionId },
    });

    if (!confession) {
      throw new NotFoundException('Confession not found');
    }

    // 2. Verify the reacting anonymous user exists.
    const anonymousUser = await this.anonymousUserRepo.findOne({
      where: { id: dto.anonymousUserId },
    });

    if (!anonymousUser) {
      throw new NotFoundException('Anonymous user not found');
    }

    // 3. Prevent duplicate reactions from the same anonymous user
    //    on the same confession.
    const existing = await this.reactionRepo.findOne({
      where: {
        confession: { id: dto.confessionId },
        anonymousUser: { id: dto.anonymousUserId },
      },
    });

    if (existing) {
      // If the emoji is the same, treat as idempotent and return as-is.
      if (existing.emoji === dto.emoji) {
        this.logger.log(
          `Duplicate reaction ignored: user=${dto.anonymousUserId} confession=${dto.confessionId}`,
        );
        return existing;
      }

      // If the emoji differs, the user is switching their reaction.
      existing.emoji = dto.emoji;
      const updated = await this.reactionRepo.save(existing);
      this.logger.log(
        `Reaction updated: user=${dto.anonymousUserId} confession=${dto.confessionId} emoji=${dto.emoji}`,
      );
      return updated;
    }

    // 4. Persist the new reaction using only valid entity relations:
    //    - confession  → AnonymousConfession (via confession_id FK)
    //    - anonymousUser → AnonymousUser     (via anonymous_user_id FK)
    //    There is no `user` field on Reaction and no `confession.user` — do
    //    NOT reference either.
    const reaction = this.reactionRepo.create({
      emoji: dto.emoji,
      confession,
      anonymousUser,
    });

    const savedReaction = await this.reactionRepo.save(reaction);

    this.logger.log(
      `Reaction created: id=${savedReaction.id} confession=${dto.confessionId} user=${dto.anonymousUserId}`,
    );

    return savedReaction;
  }
}