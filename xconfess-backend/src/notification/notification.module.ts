import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationQueue } from './notification.queue';
import { RecipientResolver } from './recipient-resolver.service';
import { EmailModule } from '../email/email.module';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    EmailModule,
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    NotificationQueue,
    RecipientResolver,
  ],
  exports: [
    NotificationQueue,
    RecipientResolver,
  ],
})
export class NotificationModule {}
