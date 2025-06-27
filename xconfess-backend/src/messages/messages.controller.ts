import { Controller, Post, Body, UseGuards, Request, ForbiddenException, NotFoundException, Get, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto, ReplyMessageDto } from './dto/message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationQueue } from '../notification/notification.queue';
import { ViewMessagesDto } from './dto/view-messages.dto';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly notificationQueue: NotificationQueue,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async sendMessage(@Body() dto: CreateMessageDto, @Request() req) {
    const message = await this.messagesService.create(dto, req.user);
    // Notify confession author (anonymously)
    await this.notificationQueue.enqueueCommentNotification({
      confession: message.confession,
      comment: { content: message.content } as any, // minimal payload for notification
      recipientEmail: message.confession.user?.email || '',
    });
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reply')
  async replyMessage(@Body() dto: ReplyMessageDto, @Request() req) {
    const message = await this.messagesService.reply(dto, req.user);
    // Optionally notify sender (anonymously)
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMessages(@Query() query: ViewMessagesDto, @Request() req) {
    const messages = await this.messagesService.findForConfessionAuthor(query.confession_id, req.user);
    // Hide sender info for anonymity
    return messages.map(m => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      hasReply: m.hasReply,
      replyContent: m.replyContent,
      repliedAt: m.repliedAt,
    }));
  }
}
