import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { EmailModule } from '../email/email.module';
import { AnonymousUser } from './entities/anonymous-user.entity';
import { AnonymousUserService } from './anonymous-user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AnonymousUser]),
    forwardRef(() => EmailModule),
  ],
  providers: [UserService, AnonymousUserService],
  controllers: [UserController],
  exports: [UserService, AnonymousUserService],
})
export class UserModule {}
