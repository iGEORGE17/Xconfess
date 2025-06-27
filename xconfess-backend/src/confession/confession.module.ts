import { Module, NestModule, MiddlewareConsumer, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnonymousConfessionRepository } from './repository/confession.repository';
import { AnonymousConfession } from './entities/confession.entity';
import { ReactionModule } from '../reaction/reaction.module';
import { AnonymousContextMiddleware } from '../middleware/anonymous-context.middleware';
import { ConfessionViewCacheService } from './confession-view-cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnonymousConfession]),
    forwardRef(() => ReactionModule),
  ],
  providers: [
    AnonymousConfessionRepository,
    ConfessionViewCacheService,
  ],
  exports: [AnonymousConfessionRepository],
})
export class ConfessionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AnonymousContextMiddleware)
      .forRoutes('confessions');
  }
}
