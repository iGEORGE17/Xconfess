// src/data-export/data-cleanup.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan } from 'typeorm';

@Injectable()
export class DataCleanupService {
  constructor(@InjectRepository(ExportRequest) private repo: Repository<ExportRequest>) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeOldExports() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // We keep the record but delete the heavy binary data
    await this.repo.update(
      { createdAt: LessThan(sevenDaysAgo) },
      { fileData: null, status: 'EXPIRED' }
    );
  }
}