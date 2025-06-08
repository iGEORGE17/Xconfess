import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { AnonymousContextMiddleware } from '../middleware/anonymous-context.middleware';
import { AnonymousConfession } from '../confession/entities/confession.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, AnonymousConfession])],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AnonymousContextMiddleware)
      .forRoutes('comments');
  }
} 