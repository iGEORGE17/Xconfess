import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    private commentRepository: Repository<Comment>,
    @InjectRepository(AnonymousConfession)
    private confessionRepository: Repository<AnonymousConfession>,
    private readonly notificationQueue: NotificationQueue,
  ) {}

  async create(
    content: string,
    user: User,
    confessionId: string,
    anonymousContextId: string,
  ): Promise<Comment> {
    const confession = await this.confessionRepository.findOne({
      where: { id: confessionId },
      relations: ['user'],
    });

    if (!confession) {
      throw new NotFoundException('Confession not found');
    }

    const comment = this.commentRepository.create({
      content,
      user,
      confession,
      anonymousContextId,
    });

    const savedComment = await this.commentRepository.save(comment);

    // If the confession has an owner, send them a notification
    if (confession.user?.email) {
      await this.notificationQueue.enqueueCommentNotification({
        confession,
        comment: savedComment,
        recipientEmail: confession.user.email,
      });
    }

    return savedComment;
  }

  async findByConfessionId(confessionId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { confession: { id: confessionId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: number, user: User): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user.id !== user.id) {
      throw new BadRequestException('You can only delete your own comments');
    }

    await this.commentRepository.remove(comment);
  }
} 