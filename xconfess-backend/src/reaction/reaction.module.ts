import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionService } from './reaction.service';
import { ReactionController } from './reaction.controller';
import { AnonymousConfession } from 'src/confession/entities/confession.entity';
import { Reaction } from './entities/reaction.entity';
import { ConfessionModule } from 'src/confession/confession.module';

@Module({
  imports: [ConfessionModule, TypeOrmModule.forFeature([Reaction, AnonymousConfession])],
  controllers: [ReactionController],
  providers: [ReactionService],
  exports: [ReactionService],
})
export class ReactionModule {}
