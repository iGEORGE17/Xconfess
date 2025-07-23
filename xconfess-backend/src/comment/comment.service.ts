import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { User } from '../user/entities/user.entity';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { NotificationQueue } from '../notification/notification.queue';
import { ModerationComment, ModerationStatus } from './entities/moderation-comment.entity';
import { AnonymousUser } from '../user/entities/anonymous-user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
    @InjectRepository(AnonymousConfession)
    private confessionRepo: Repository<AnonymousConfession>,
    @InjectRepository(ModerationComment)
    private moderationCommentRepo: Repository<ModerationComment>,
    private readonly notificationQueue: NotificationQueue,
  ) {}

  async create(
    content: string,
    user: AnonymousUser,
    confessionId: string,
    anonymousContextId: string,
  ): Promise<Comment> {
    const confession = await this.confessionRepo.findOne({
      where: { id: confessionId, isDeleted: false },
      relations: ['anonymousUser'],
    });

    if (!confession) {
      throw new NotFoundException('Confession not found');
    }

    const comment = this.commentRepo.create({
      content,
      anonymousUser: user,
      confession,
      anonymousContextId,
    });

    const saved = await this.commentRepo.save(comment);

    // Add moderation entry
    await this.moderationCommentRepo.save(
      this.moderationCommentRepo.create({
        comment: saved,
        commentId: saved.id,
        status: ModerationStatus.PENDING,
      })
    );

    return saved;
  }

  async findByConfessionId(confessionId: string): Promise<Comment[]> {
    // Only return comments with approved moderation status
    const comments = await this.commentRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.confession', 'confession')
      .leftJoinAndSelect('comment.anonymousUser', 'anonymousUser')
      .innerJoin('moderation_comments', 'moderation', 'moderation.commentId = comment.id')
      .where('comment.confession = :confessionId', { confessionId })
      .andWhere('comment.isDeleted = false')
      .andWhere('moderation.status = :status', { status: ModerationStatus.APPROVED })
      .orderBy('comment.createdAt', 'DESC')
      .getMany();
    return comments;
  }

  async delete(id: number, user: AnonymousUser): Promise<void> {
    const comment = await this.commentRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['anonymousUser'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.anonymousUser.id !== user.id) {
      throw new BadRequestException('You can only delete your own comments');
    }

    await this.commentRepo.update(id, { isDeleted: true });
  }

  async moderateComment(
    commentId: number,
    status: ModerationStatus,
    moderator: User,
  ): Promise<{ success: boolean; message: string }> {
    const moderation = await this.moderationCommentRepo.findOne({
      where: { comment: { id: commentId } },
      relations: ['comment'],
    });
    if (!moderation) {
      throw new NotFoundException('Moderation entry not found for comment');
    }
    if (moderation.status !== ModerationStatus.PENDING) {
      throw new BadRequestException('Comment has already been moderated');
    }
    moderation.status = status;
    moderation.moderatedAt = new Date();
    moderation.moderatedBy = moderator;
    moderation.moderatedById = moderator.id;
    await this.moderationCommentRepo.save(moderation);
    return { success: true, message: `Comment ${status}` };
  }
}
