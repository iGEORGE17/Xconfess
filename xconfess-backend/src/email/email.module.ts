import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { User } from '../user/entities/user.entity';
import { AnonymousConfession } from '../confession/entities/confession.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, AnonymousConfession]),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}