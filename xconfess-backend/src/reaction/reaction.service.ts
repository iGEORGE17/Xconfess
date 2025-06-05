import { Inject, Injectable, Logger, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { Reaction } from './entities/reaction.entity';
import { EmailService } from '../email/email.service';
import { User } from '../user/entities/user.entity';

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
    // Find the confession with the user who created it
    const confession = await this.confessionRepo.findOne({ 
      where: { id: dto.confessionId },
      relations: ['user']
    });

    if (!confession) {
      throw new NotFoundException('Confession not found');
    }

    // Find the user who is reacting (if authenticated)
    let user: User | null = null;
    if (userId) {
      user = await this.confessionRepo.manager.findOne(User, { where: { id: userId } });
    }

    // Create the reaction
    const reaction = this.reactionRepo.create({
      emoji: dto.emoji,
      confession,
      user: user || null,
    });

    const savedReaction = await this.reactionRepo.save(reaction);

    // Send notification email if the confession has an author with email
    if (confession.user?.email) {
      try {
        const reactorName = user?.username || 'Someone';
        await this.emailService.sendReactionNotification(
          confession.user.email,
          confession.user.username,
          reactorName,
          dto.emoji,
          confession.message
        );
        this.logger.log(`Reaction notification sent to ${confession.user.email}`);
      } catch (emailError) {
        // Log but don't fail the operation if email sending fails
        this.logger.error(
          `Failed to send reaction notification: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`,
          emailError instanceof Error ? emailError.stack : ''
        );
      }
    }

    return savedReaction;
  }
}
