import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { User } from './entities/user.entity';

interface RegisterDto {
  email: string;
  password: string;
  username: string;
}

interface LoginDto {
  email: string;
  password: string;
}

export type UserResponse = Omit<User, 'password'>;

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<UserResponse> {
    const user = await this.userService.create(
      registerDto.email,
      registerDto.password,
      registerDto.username,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ access_token: string; user: UserResponse }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.authService.login(loginDto.email, loginDto.password);
  }
}
