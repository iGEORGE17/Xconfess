import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { NotificationQueue } from './notification.queue';

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, AdminGuard)
export class NotificationAdminController {
  constructor(private readonly notificationQueue: NotificationQueue) {}

  @Get('dlq')
  async listDlqJobs(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('failedAfter') failedAfter?: string,
    @Query('failedBefore') failedBefore?: string,
    @Query('search') search?: string,
  ) {
    return this.notificationQueue.listDlqJobs(page, limit, {
      failedAfter,
      failedBefore,
      search,
    });
  }

  @Post('dlq/:jobId/replay')
  async replayDlqJob(
    @Param('jobId') jobId: string,
    @Body('reason') reason: string | undefined,
    @Req() req: any,
  ) {
    const actorId = String(req.user?.id);
    return this.notificationQueue.replayDlqJob(jobId, actorId, reason);
  }

  @Post('dlq/replay')
  async replayDlqJobsBulk(
    @Body()
    body: {
      limit?: number;
      failedAfter?: string;
      failedBefore?: string;
      search?: string;
      reason?: string;
    },
    @Req() req: any,
  ) {
    const actorId = String(req.user?.id);
    return this.notificationQueue.replayDlqJobsBulk(actorId, body);
  }
}
