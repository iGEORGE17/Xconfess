import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnonymousConfessionRepository } from './repository/confession.repository';
import { AnonymousConfession } from './entities/confession.entity';
import { ReactionModule } from '../reaction/reaction.module';
import { AnonymousContextMiddleware } from '../middleware/anonymous-context.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnonymousConfession]),
    forwardRef(() => ReactionModule),
  ],
  providers: [AnonymousConfessionRepository],
  exports: [AnonymousConfessionRepository],
})
export class ConfessionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AnonymousContextMiddleware)
      .forRoutes('confessions');
  }
}
