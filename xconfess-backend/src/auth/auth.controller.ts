import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    try {
      return await this.authService.resetPassword(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Handle generic errors
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException('Failed to reset password: ' + errorMessage);
    }
  }
} 