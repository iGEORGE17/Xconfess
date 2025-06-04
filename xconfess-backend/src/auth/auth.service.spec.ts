import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

// Mock crypto.randomBytes
jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    resetPasswordToken: null,
    resetPasswordExpires: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserService = {
    findByEmail: jest.fn(),
    findByResetToken: jest.fn(),
    setResetPasswordToken: jest.fn(),
    updatePassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password for valid credentials', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        resetPasswordToken: null,
        resetPasswordExpires: null,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should return null for invalid credentials', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user for valid credentials', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        resetPasswordToken: null,
        resetPasswordExpires: null,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login('test@example.com', 'password123');

      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          resetPasswordToken: null,
          resetPasswordExpires: null,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(
        service.login('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('generateResetPasswordToken', () => {
    it('should generate and store reset token for valid email', async () => {
      const mockToken = 'mock-reset-token';
      const crypto = require('crypto');
      crypto.randomBytes.mockReturnValue({ toString: () => mockToken });

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockUserService.setResetPasswordToken.mockResolvedValue(undefined);

      const result = await service.generateResetPasswordToken('test@example.com');

      expect(result).toBe(mockToken);
      expect(mockUserService.setResetPasswordToken).toHaveBeenCalledWith(
        1,
        mockToken,
        expect.any(Date),
      );
    });

    it('should throw BadRequestException for non-existent email', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        service.generateResetPasswordToken('nonexistent@example.com'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid token', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const userWithToken = {
        ...mockUser,
        resetPasswordToken: 'valid-token',
        resetPasswordExpires: futureDate,
      };

      mockUserService.findByResetToken.mockResolvedValue(userWithToken);
      mockUserService.updatePassword.mockResolvedValue(undefined);

      const result = await service.resetPassword('valid-token', 'newpassword123');

      expect(result).toEqual({ message: 'Password has been reset successfully' });
      expect(mockUserService.updatePassword).toHaveBeenCalledWith(1, 'newpassword123');
    });

    it('should throw BadRequestException for invalid token', async () => {
      mockUserService.findByResetToken.mockResolvedValue(null);

      await expect(
        service.resetPassword('invalid-token', 'newpassword123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired token', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      const userWithExpiredToken = {
        ...mockUser,
        resetPasswordToken: 'expired-token',
        resetPasswordExpires: pastDate,
      };

      mockUserService.findByResetToken.mockResolvedValue(userWithExpiredToken);

      await expect(
        service.resetPassword('expired-token', 'newpassword123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when reset token expires field is null', async () => {
      const userWithNullExpiry = {
        ...mockUser,
        resetPasswordToken: 'valid-token',
        resetPasswordExpires: null,
      };

      mockUserService.findByResetToken.mockResolvedValue(userWithNullExpiry);

      await expect(
        service.resetPassword('valid-token', 'newpassword123'),
      ).rejects.toThrow(BadRequestException);
    });
  });
}); 