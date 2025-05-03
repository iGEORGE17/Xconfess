import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnonymousConfessionRepository } from './repository/confession.repository';
import { AnonymousConfession } from './entities/confession.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnonymousConfession])],
  providers: [AnonymousConfessionRepository],
  exports: [AnonymousConfessionRepository],
})
export class ConfessionModule {}
