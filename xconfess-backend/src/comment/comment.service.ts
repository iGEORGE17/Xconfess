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

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
    @InjectRepository(AnonymousConfession)
    private confessionRepo: Repository<AnonymousConfession>,
    private readonly notificationQueue: NotificationQueue,
  ) {}

  async create(
    content: string,
    user: User,
    confessionId: string,
    anonymousContextId: string,
  ): Promise<Comment> {
    const confession = await this.confessionRepo.findOne({
      where: { id: confessionId, isDeleted: false },
      relations: ['user'],
    });

    if (!confession) {
      throw new NotFoundException('Confession not found');
    }

    const comment = this.commentRepo.create({
      content,
      user,
      confession,
      anonymousContextId,
    });

    const saved = await this.commentRepo.save(comment);

    if (confession.user?.email) {
      await this.notificationQueue.enqueueCommentNotification({
        confession,
        comment: saved,
        recipientEmail: confession.user.email,
      });
    }
    return saved;
  }

  async findByConfessionId(confessionId: string): Promise<Comment[]> {
    return this.commentRepo.find({
      where: {
        confession: { id: confessionId },
        isDeleted: false,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: number, user: User): Promise<void> {
    const comment = await this.commentRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.user.id !== user.id) {
      throw new BadRequestException('You can only delete your own comments');
    }

    await this.commentRepo.update(id, { isDeleted: true });
  }
}
