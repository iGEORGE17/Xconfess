import { Injectable, ForbiddenException, NotFoundException,BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto, ReplyMessageDto } from './dto/message.dto';
import { User } from '../user/entities/user.entity';
import { AnonymousConfession } from '../confession/entities/confession.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(AnonymousConfession)
    private readonly confessionRepository: Repository<AnonymousConfession>,
  ) {}

  async create(createMessageDto: CreateMessageDto, sender: any): Promise<Message> {
    const confession = await this.confessionRepository.findOne({ where: { id: createMessageDto.confession_id }, relations: ['anonymousUser'] });
    if (!confession) throw new NotFoundException('Confession not found');

    const senderId = (sender as any)?.userId ?? (sender as any)?.id;
    const senderUser = senderId
      ? await this.confessionRepository.manager.findOne(User, { where: { id: senderId } })
      : null;
    if (!senderUser) throw new NotFoundException('User not found');

    const message = this.messageRepository.create({
      sender: senderUser,
      confession,
      content: createMessageDto.content,
    });
    return this.messageRepository.save(message);
  }

  async findForConfessionAuthor(confessionId: string, user: User): Promise<Message[]> {
    // Validate confessionId format
    if (!confessionId || confessionId.trim() === '') {
      throw new BadRequestException('Invalid confession ID');
    }
    const confession = await this.confessionRepository.findOne({ where: { id: confessionId }, relations: ['anonymousUser'] });
    if (!confession) throw new NotFoundException('Confession not found');
     // Consider adding pagination for large message lists
    return this.messageRepository.find({ 
      where: { confession: { id: confessionId } }, 
      order: { createdAt: 'DESC' },
      take: 100 // Limit to prevent performance issues
    });
  }

  async reply(dto: ReplyMessageDto, user: User): Promise<Message> {
    // Validate reply content
    if (!dto.reply || dto.reply.trim() === '') {
      throw new BadRequestException('Reply content cannot be empty');
    }
    const message = await this.messageRepository.findOne({ where: { id: dto.message_id }, relations: ['confession', 'confession.anonymousUser'] });
    if (!message) throw new NotFoundException('Message not found');
    if (message.hasReply) throw new ForbiddenException('Already replied');
   
    // Use a transaction to ensure atomicity
    return this.messageRepository.manager.transaction(async manager => {
      message.hasReply = true;
      message.replyContent = dto.reply.trim();
      message.repliedAt = new Date();
      return manager.save(message);
    });
  }
}
