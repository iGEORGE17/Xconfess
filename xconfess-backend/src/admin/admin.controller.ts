import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminService } from './services/admin.service';
import { ModerationService } from './services/moderation.service';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { BulkResolveDto } from './dto/bulk-resolve.dto';
import { ReportStatus, ReportType } from './entities/report.entity';
import { Request } from 'express';

type AuthedRequest = Request & { user?: any };

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly moderationService: ModerationService,
  ) {}

  // Reports
  @Get('reports')
  async getReports(
    @Query('status') status?: ReportStatus,
    @Query('type') type?: ReportType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const [reports, total] = await this.adminService.getReports(
      status,
      type,
      start,
      end,
      parseInt(limit || '50', 10),
      parseInt(offset || '0', 10),
    );

    return {
      reports,
      total,
      limit: parseInt(limit || '50', 10),
      offset: parseInt(offset || '0', 10),
    };
  }

  @Get('reports/:id')
  async getReportById(@Param('id') id: string) {
    return this.adminService.getReportById(id);
  }

  @Patch('reports/:id/resolve')
  @HttpCode(HttpStatus.OK)
  async resolveReport(
    @Param('id') id: string,
    @Body() dto: ResolveReportDto,
    @Req() req: AuthedRequest,
  ) {
    const adminId = parseInt((req.user as any).userId || (req.user as any).sub, 10);
    return this.adminService.resolveReport(
      id,
      adminId,
      dto.resolutionNotes || null,
      req,
    );
  }

  @Patch('reports/:id/dismiss')
  @HttpCode(HttpStatus.OK)
  async dismissReport(
    @Param('id') id: string,
    @Body() dto: ResolveReportDto,
    @Req() req: AuthedRequest,
  ) {
    const adminId = parseInt((req.user as any).userId || (req.user as any).sub, 10);
    return this.adminService.dismissReport(
      id,
      adminId,
      dto.resolutionNotes || null,
      req,
    );
  }

  @Patch('reports/bulk-resolve')
  @HttpCode(HttpStatus.OK)
  async bulkResolveReports(
    @Body() dto: BulkResolveDto,
    @Req() req: AuthedRequest,
  ) {
    const adminId = parseInt((req.user as any).userId || (req.user as any).sub, 10);
    const count = await this.adminService.bulkResolveReports(
      dto.reportIds,
      adminId,
      dto.notes || null,
      req,
    );
    return { resolved: count };
  }

  // Confessions
  @Delete('confessions/:id')
  @HttpCode(HttpStatus.OK)
  async deleteConfession(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Req() req: AuthedRequest,
  ) {
    const adminId = parseInt((req.user as any).userId || (req.user as any).sub, 10);
    await this.adminService.deleteConfession(
      id,
      adminId,
      body.reason || null,
      req,
    );
    return { message: 'Confession deleted successfully' };
  }

  @Patch('confessions/:id/hide')
  @HttpCode(HttpStatus.OK)
  async hideConfession(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Req() req: AuthedRequest,
  ) {
    const adminId = parseInt((req.user as any).userId || (req.user as any).sub, 10);
    return this.adminService.hideConfession(
      id,
      adminId,
      body.reason || null,
      req,
    );
  }

  @Patch('confessions/:id/unhide')
  @HttpCode(HttpStatus.OK)
  async unhideConfession(
    @Param('id') id: string,
    @Req() req: AuthedRequest,
  ) {
    const adminId = parseInt((req.user as any).userId || (req.user as any).sub, 10);
    return this.adminService.unhideConfession(id, adminId, req);
  }

  // Users
  @Get('users/search')
  async searchUsers(
    @Query('q') query: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    if (!query) {
      return { users: [], total: 0 };
    }
    const [users, total] = await this.adminService.searchUsers(
      query,
      parseInt(limit || '50', 10),
      parseInt(offset || '0', 10),
    );
    return { users, total };
  }

  @Get('users/:id/history')
  async getUserHistory(@Param('id') id: string) {
    return this.adminService.getUserHistory(parseInt(id, 10));
  }

  @Patch('users/:id/ban')
  @HttpCode(HttpStatus.OK)
  async banUser(
    @Param('id') id: string,
    @Body() dto: BanUserDto,
    @Req() req: AuthedRequest,
  ) {
    const adminId = parseInt((req.user as any).userId || (req.user as any).sub, 10);
    return this.adminService.banUser(
      parseInt(id, 10),
      adminId,
      dto.reason || null,
      req,
    );
  }

  @Patch('users/:id/unban')
  @HttpCode(HttpStatus.OK)
  async unbanUser(
    @Param('id') id: string,
    @Req() req: AuthedRequest,
  ) {
    const adminId = parseInt((req.user as any).userId || (req.user as any).sub, 10);
    return this.adminService.unbanUser(parseInt(id, 10), adminId, req);
  }

  // Analytics
  @Get('analytics')
  async getAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.adminService.getAnalytics(start, end);
  }

  // Audit Logs
  @Get('audit-logs')
  async getAuditLogs(
    @Query('adminId') adminId?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const [logs, total] = await this.moderationService.getAuditLogs(
      adminId ? parseInt(adminId, 10) : undefined,
      action as any,
      entityType,
      entityId,
      parseInt(limit || '100', 10),
      parseInt(offset || '0', 10),
    );

    return {
      logs,
      total,
      limit: parseInt(limit || '100', 10),
      offset: parseInt(offset || '0', 10),
    };
  }
}
