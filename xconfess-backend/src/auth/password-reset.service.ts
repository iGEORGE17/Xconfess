import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordReset } from './entities/password-reset.entity';
import * as crypto from 'crypto';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
  ) {}

  async createResetToken(
    userId: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    try {
      // Generate a secure random token
      const token = crypto.randomBytes(32).toString('hex');
      
      // Set expiration to 15 minutes from now
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      // Create password reset record
      const passwordReset = this.passwordResetRepository.create({
        token,
        userId,
        expiresAt,
        ipAddress,
        userAgent,
      });

      await this.passwordResetRepository.save(passwordReset);

      this.logger.log(`Password reset token created for user ID: ${userId}`, {
        userId,
        tokenId: passwordReset.id,
        expiresAt,
        ipAddress,
      });

      return token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create reset token for user ID ${userId}: ${errorMessage}`);
      throw new Error(`Failed to create reset token: ${errorMessage}`);
    }
  }

  async findValidToken(token: string): Promise<PasswordReset | null> {
    try {
      const passwordReset = await this.passwordResetRepository.findOne({
        where: {
          token,
          used: false,
        },
        relations: ['user'],
      });

      if (!passwordReset) {
        this.logger.debug(`No unused token found: ${token}`);
        return null;
      }

      // Check if token has expired
      if (new Date() > passwordReset.expiresAt) {
        this.logger.debug(`Token expired: ${token}`, {
          tokenId: passwordReset.id,
          expiresAt: passwordReset.expiresAt,
        });
        return null;
      }

      return passwordReset;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error finding token: ${errorMessage}`);
      throw new Error(`Error finding token: ${errorMessage}`);
    }
  }

  async markTokenAsUsed(tokenId: number): Promise<void> {
    try {
      await this.passwordResetRepository.update(tokenId, {
        used: true,
        usedAt: new Date(),
      });

      this.logger.log(`Password reset token marked as used`, {
        tokenId,
        usedAt: new Date(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to mark token as used: ${errorMessage}`);
      throw new Error(`Failed to mark token as used: ${errorMessage}`);
    }
  }

  async invalidateUserTokens(userId: number): Promise<void> {
    try {
      await this.passwordResetRepository.update(
        { userId, used: false },
        { used: true, usedAt: new Date() },
      );

      this.logger.log(`All tokens invalidated for user ID: ${userId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to invalidate tokens for user ${userId}: ${errorMessage}`);
      throw new Error(`Failed to invalidate tokens: ${errorMessage}`);
    }
  }

  async cleanupExpiredTokens(): Promise<void> {
    try {
      const result = await this.passwordResetRepository.delete({
        expiresAt: { $lt: new Date() } as any,
      });

      this.logger.log(`Cleaned up expired tokens`, {
        deletedCount: result.affected || 0,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to cleanup expired tokens: ${errorMessage}`);
    }
  }
} 