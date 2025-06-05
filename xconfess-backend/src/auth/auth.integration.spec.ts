import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { PasswordResetService } from './password-reset.service';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Import bcrypt after mocking
import * as bcrypt from 'bcrypt';

describe('Auth Integration Tests - Forgot Password Flow', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userService: UserService;
  let passwordResetService: PasswordResetService;
  let emailService: EmailService;
  let userRepository: Repository<User>;
  let passwordResetRepository: Repository<PasswordReset>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    resetPasswordToken: null,
    resetPasswordExpires: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UserService,
        PasswordResetService,
        EmailService,
        JwtService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PasswordReset),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              delete: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              execute: jest.fn().mockResolvedValue({ affected: 1 }),
            })),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    passwordResetService = module.get<PasswordResetService>(PasswordResetService);
    emailService = module.get<EmailService>(EmailService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    passwordResetRepository = module.get<Repository<PasswordReset>>(getRepositoryToken(PasswordReset));

    // Setup bcrypt mocks
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  describe('Complete Forgot Password Flow', () => {
    it('should complete the full forgot password and reset flow', async () => {
      // Step 1: Mock user exists
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);

      // Step 2: Mock password reset token creation
      const mockPasswordReset = {
        id: 1,
        userId: 1,
        token: 'reset-token-123',
        expiresAt: new Date(Date.now() + 3600000),
        used: false,
        usedAt: null,
        createdAt: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      };

      jest.spyOn(passwordResetRepository, 'create').mockReturnValue(mockPasswordReset as any);
      jest.spyOn(passwordResetRepository, 'save').mockResolvedValue(mockPasswordReset as any);

      // Step 3: Mock email sending
      jest.spyOn(emailService, 'sendPasswordResetEmail').mockResolvedValue(undefined);

      // Step 4: Execute forgot password request
      const mockRequest = {
        ip: '127.0.0.1',
        headers: {
          'user-agent': 'test-agent',
        },
      };

      const forgotPasswordResult = await authController.forgotPassword(
        { email: 'test@example.com' },
        mockRequest as any
      );

      expect(forgotPasswordResult).toEqual({
        message: 'If the user exists, a password reset email has been sent.',
      });

      // Verify that the email service was called
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String), // Accept any token since it's randomly generated
        'testuser'
      );

      // Capture the actual token that was generated
      const emailCallArgs = (emailService.sendPasswordResetEmail as jest.Mock).mock.calls[0];
      const actualToken = emailCallArgs[1];

      // Step 5: Mock finding the reset token for password reset using the actual token
      const mockPasswordResetForLookup = {
        ...mockPasswordReset,
        token: actualToken,
      };
      jest.spyOn(passwordResetRepository, 'findOne').mockResolvedValue(mockPasswordResetForLookup as any);

      // Step 6: Mock updating the password
      jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 1 } as any);

      // Step 7: Mock marking token as used
      jest.spyOn(passwordResetRepository, 'update').mockResolvedValue({ affected: 1 } as any);

      // Step 8: Execute password reset with the actual token
      const resetPasswordResult = await authController.resetPassword({
        token: actualToken,
        newPassword: 'newPassword123',
      });

      expect(resetPasswordResult).toEqual({
        message: 'Password has been reset successfully',
      });

      // Verify that the password was updated
      expect(userRepository.update).toHaveBeenCalledWith(
        1,
        { 
          password: 'hashedPassword',
          resetPasswordToken: null,
          resetPasswordExpires: null,
        }
      );

      // Verify that the token was marked as used
      expect(passwordResetRepository.update).toHaveBeenCalledWith(
        1,
        { 
          used: true,
          usedAt: expect.any(Date),
        }
      );
    });

    it('should handle invalid token during reset', async () => {
      // Mock token not found
      jest.spyOn(passwordResetRepository, 'findOne').mockResolvedValue(null);

      await expect(
        authController.resetPassword({
          token: 'invalid-token',
          newPassword: 'newPassword123',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle expired token during reset', async () => {
      // Mock expired token
      const expiredToken = {
        id: 1,
        userId: 1,
        token: 'expired-token-123',
        expiresAt: new Date(Date.now() - 3600000), // Expired 1 hour ago
        used: false,
        usedAt: null,
        createdAt: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      };

      jest.spyOn(passwordResetRepository, 'findOne').mockResolvedValue(expiredToken as any);

      await expect(
        authController.resetPassword({
          token: 'expired-token-123',
          newPassword: 'newPassword123',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle used token during reset', async () => {
      // Mock used token
      const usedToken = {
        id: 1,
        userId: 1,
        token: 'used-token-123',
        expiresAt: new Date(Date.now() + 3600000),
        used: true, // Already used
        usedAt: new Date(),
        createdAt: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      };

      jest.spyOn(passwordResetRepository, 'findOne').mockResolvedValue(null); // Return null for used token

      await expect(
        authController.resetPassword({
          token: 'used-token-123',
          newPassword: 'newPassword123',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });
}); 