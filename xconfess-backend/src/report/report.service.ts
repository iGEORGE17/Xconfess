import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../admin/entities/report.entity';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(AnonymousConfession)
    private readonly confessionRepository: Repository<AnonymousConfession>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createReport(dto: CreateReportDto, reporterId: number | null) {
    const confession = await this.confessionRepository.findOne({
      where: { id: dto.confessionId },
    });

    if (!confession) {
      throw new NotFoundException('Confession not found');
    }

    const report = this.reportRepository.create({
      confessionId: dto.confessionId,
      reporterId,
      type: dto.type,
      reason: dto.reason ?? null,
      status: 'pending' as any,
    });

    const saved = await this.reportRepository.save(report);

    // Notify listeners (admin realtime, etc.)
    this.eventEmitter.emit('report.created', {
      reportId: saved.id,
      confessionId: saved.confessionId,
      type: saved.type,
      status: saved.status,
      createdAt: saved.createdAt,
    });

    return saved;
  }
}

