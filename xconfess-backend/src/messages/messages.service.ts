import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
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

  async create(createMessageDto: CreateMessageDto, sender: User): Promise<Message> {
    const confession = await this.confessionRepository.findOne({ where: { id: String(createMessageDto.confession_id) }, relations: ['user'] });
    if (!confession) throw new NotFoundException('Confession not found');
    if (confession.user?.id === sender.id) throw new ForbiddenException('Cannot message your own confession');
    const message = this.messageRepository.create({
      sender,
      confession,
      content: createMessageDto.content,
    });
    return this.messageRepository.save(message);
  }

  async findForConfessionAuthor(confessionId: string, user: User): Promise<Message[]> {
    const confession = await this.confessionRepository.findOne({ where: { id: confessionId }, relations: ['user'] });
    if (!confession) throw new NotFoundException('Confession not found');
    if (confession.user?.id !== user.id) throw new ForbiddenException('Not the confession author');
    return this.messageRepository.find({ where: { confession: { id: confessionId } }, order: { createdAt: 'DESC' } });
  }

  async reply(dto: ReplyMessageDto, user: User): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id: dto.message_id }, relations: ['confession', 'confession.user'] });
    if (!message) throw new NotFoundException('Message not found');
    if (message.confession.user?.id !== user.id) throw new ForbiddenException('Not the confession author');
    if (message.hasReply) throw new ForbiddenException('Already replied');
    message.hasReply = true;
    message.replyContent = dto.reply;
    message.repliedAt = new Date();
    return this.messageRepository.save(message);
  }
}
