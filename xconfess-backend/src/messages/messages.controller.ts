import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto, ReplyMessageDto } from './dto/message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationQueue } from '../notification/notification.queue';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly notificationQueue: NotificationQueue,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async sendMessage(@Body() dto: CreateMessageDto, @GetUser() user: User) {
    const message = await this.messagesService.create(dto, user);
    // Confessions are anonymous; no email notification is sent here.
    return { success: true, messageId: message.id };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reply')
  async replyMessage(@Body() dto: ReplyMessageDto, @GetUser() user: User) {
    await this.messagesService.reply(dto, user);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('threads')
  async getThreads(@GetUser() user: User) {
    return this.messagesService.findAllThreadsForUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMessages(
    @Query('confession_id') confession_id: string,
    @Query('sender_id') sender_id: string,
    @GetUser() user: User,
  ) {
    const messages = await this.messagesService.findForConfessionThread(
      confession_id,
      sender_id,
      user,
    );
    // Hide sender info for anonymity
    return {
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.createdAt,
        hasReply: m.hasReply,
        replyContent: m.replyContent,
        repliedAt: m.repliedAt,
      })),
      total: messages.length,
    };
  }
}
