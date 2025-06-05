import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionService } from './reaction.service';
import { ReactionController } from './reaction.controller';
import { AnonymousConfession } from '../confession/entities/confession.entity';
import { Reaction } from './entities/reaction.entity';
import { ConfessionModule } from '../confession/confession.module';
import { EmailModule } from '../email/email.module';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    forwardRef(() => ConfessionModule),
    forwardRef(() => EmailModule),
    TypeOrmModule.forFeature([Reaction, AnonymousConfession, User]),
  ],
  controllers: [ReactionController],
  providers: [ReactionService],
  exports: [ReactionService],
})
export class ReactionModule {}
