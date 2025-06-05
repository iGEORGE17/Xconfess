import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnonymousConfessionRepository } from './repository/confession.repository';
import { AnonymousConfession } from './entities/confession.entity';
import { ReactionModule } from '../reaction/reaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnonymousConfession]),
    forwardRef(() => ReactionModule),
  ],
  providers: [AnonymousConfessionRepository],
  exports: [AnonymousConfessionRepository],
})
export class ConfessionModule {}
