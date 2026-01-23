import { Injectable } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { ConfessionDraftService } from './confession-draft.service';

@Injectable()
export class ConfessionDraftQueue {
  private readonly queue: Queue;
  private readonly worker: Worker;

  constructor(
    private readonly configService: ConfigService,
    private readonly draftService: ConfessionDraftService,
  ) {
    const redisConfig = {
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
    };

    this.queue = new Queue('confession-draft-publisher', {
      connection: redisConfig,
    });

    this.worker = new Worker(
      'confession-draft-publisher',
      async (job: Job) => {
        if (job.name === 'publish-due') {
          const ids = await this.draftService.enqueueDueDraftIds();
          await Promise.all(
            ids.map((id) =>
              this.queue.add('publish-one', { id }, {
                attempts: 5,
                backoff: { type: 'exponential', delay: 1000 },
                removeOnComplete: true,
                removeOnFail: false,
              }),
            ),
          );
          return { enqueued: ids.length };
        }

        if (job.name === 'publish-one') {
          const id = (job.data as any)?.id as string;
          if (!id) return;
          await this.draftService.publishScheduledDraftById(id);
          return;
        }
      },
      { connection: redisConfig },
    );

    void this.queue.add(
      'publish-due',
      {},
      {
        repeat: { pattern: '* * * * *' },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  async onModuleDestroy() {
    await this.worker.close();
    await this.queue.close();
  }
}
