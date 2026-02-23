import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto, ReplyMessageDto } from './dto/message.dto';
import { User } from '../user/entities/user.entity';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { AnonymousUserService } from '../user/anonymous-user.service';
import { UserAnonymousUser } from '../user/entities/user-anonymous-link.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(AnonymousConfession)
    private readonly confessionRepository: Repository<AnonymousConfession>,
    @InjectRepository(UserAnonymousUser)
    private readonly userAnonRepo: Repository<UserAnonymousUser>,
    private readonly anonymousUserService: AnonymousUserService,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    user: User,
  ): Promise<Message> {
    const confession = await this.confessionRepository.findOne({
      where: { id: createMessageDto.confession_id },
      relations: ['anonymousUser'],
    });
    if (!confession) throw new NotFoundException('Confession not found');

    // Get or create anonymous identity for this session
    const sender = await this.anonymousUserService.getOrCreateForUserSession(
      user.id,
    );

    const message = this.messageRepository.create({
      sender,
      confession,
      content: createMessageDto.content,
    });
    return this.messageRepository.save(message);
  }

  async findForConfessionThread(
    confessionId: string,
    senderId: string,
    user: User,
  ): Promise<Message[]> {
    if (!confessionId || confessionId.trim() === '') {
      throw new BadRequestException('Invalid confession ID');
    }
    const confession = await this.confessionRepository.findOne({
      where: { id: confessionId },
      relations: ['anonymousUser'],
    });
    if (!confession) throw new NotFoundException('Confession not found');

    const userAnons = await this.userAnonRepo.find({
      where: { userId: user.id },
    });
    const anonIds = userAnons.map((ua) => ua.anonymousUserId);

    const isAuthor = confession.anonymousUser?.id && anonIds.includes(confession.anonymousUser.id);
    const isSender = anonIds.includes(senderId);

    if (!isAuthor && !isSender) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    return this.messageRepository.find({
      where: {
        confession: { id: confessionId },
        sender: { id: senderId },
      },
      order: { createdAt: 'ASC' }, // Use ASC for chat-like order
    });
  }

  async findAllThreadsForUser(user: User): Promise<any[]> {
    const userAnons = await this.userAnonRepo.find({
      where: { userId: user.id },
    });
    const anonIds = userAnons.map((ua) => ua.anonymousUserId);

    if (anonIds.length === 0) return [];

    const messages = await this.messageRepository.find({
      where: [
        { sender: { id: In(anonIds) } },
        { confession: { anonymousUser: { id: In(anonIds) } } },
      ],
      relations: ['confession', 'sender', 'confession.anonymousUser'],
      order: { createdAt: 'DESC' },
    });

    const threadsMap = new Map();

    messages.forEach((m) => {
      const threadId = `${m.confession.id}_${m.sender.id}`;
      if (!threadsMap.has(threadId)) {
        threadsMap.set(threadId, {
          confessionId: m.confession.id,
          senderId: m.sender.id,
          confessionMessage:
            m.confession.message.substring(0, 50) +
            (m.confession.message.length > 50 ? '...' : ''),
          lastMessage: m.content,
          lastMessageAt: m.createdAt,
          hasUnread: false,
          isAuthor: anonIds.includes(m.confession.anonymousUser?.id),
        });
      }
    });

    return Array.from(threadsMap.values());
  }

  async reply(dto: ReplyMessageDto, user: User): Promise<Message> {
    // Validate reply content
    if (!dto.reply || dto.reply.trim() === '') {
      throw new BadRequestException('Reply content cannot be empty');
    }
    const message = await this.messageRepository.findOne({
      where: { id: dto.message_id },
      relations: ['confession', 'confession.anonymousUser'],
    });
    if (!message) throw new NotFoundException('Message not found');
    if (message.hasReply) throw new ForbiddenException('Already replied');

    // Verify user is author of the confession
    const userAnons = await this.userAnonRepo.find({
      where: { userId: user.id },
    });
    const anonIds = userAnons.map((ua) => ua.anonymousUserId);
    const confessionAuthorId = message.confession?.anonymousUser?.id;
    if (!confessionAuthorId || !anonIds.includes(confessionAuthorId)) {
      throw new ForbiddenException('You are not the author of this confession');
    }

    // Use a transaction to ensure atomicity
    return this.messageRepository.manager.transaction(async (manager) => {
      message.hasReply = true;
      message.replyContent = dto.reply.trim();
      message.repliedAt = new Date();
      return manager.save(message);
    });
  }
}
