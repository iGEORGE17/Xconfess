import { Controller, Post, Body, UseGuards, Request, ForbiddenException, NotFoundException, Get, Query, ParseIntPipe } from '@nestjs/common';
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
   try {
      const message = await this.messagesService.create(dto, req.user);
      
      // Only send notification if recipient email exists
      if (message.confession.user?.email) {
        await this.notificationQueue.enqueueCommentNotification({
          confession: message.confession,
          comment: { content: message.content } as any,
          recipientEmail: message.confession.user.email,
        });
      }
      
      return { success: true, messageId: message.id };
    } catch (error) {
      // Service layer exceptions will be handled by NestJS exception filters
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('reply')
  async replyMessage(@Body() dto: ReplyMessageDto, @Request() req) {
    const message = await this.messagesService.reply(dto, req.user);
   
    // Notify original sender (anonymously) if they have an email
    if (message.sender?.email) {
      await this.notificationQueue.enqueueCommentNotification({
        confession: message.confession,
        comment: { content: `Reply to your message: ${message.replyContent}` } as any,
        recipientEmail: message.sender.email,
      });
    }
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMessages(@Query('confession_id', ParseIntPipe) confession_id: number, @Request() req) {
    const messages = await this.messagesService.findForConfessionAuthor(confession_id.toString(), req.user);
    // Hide sender info for anonymity
    return {
      messages: messages.map(m => ({
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
