import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InternalServerErrorException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;
  let mockEmailService: any;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    resetPasswordToken: null,
    resetPasswordExpires: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    confessions: [],
  };

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    mockEmailService = {
      sendWelcomeEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findByEmail('test@example.com')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findById', () => {
    it('should return user when found by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null when user not found by ID', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findById(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findByResetToken', () => {
    it('should return user when found by reset token', async () => {
      const userWithToken = {
        ...mockUser,
        resetPasswordToken: 'valid-token',
      };
      mockRepository.findOne.mockResolvedValue(userWithToken);

      const result = await service.findByResetToken('valid-token');

      expect(result).toEqual(userWithToken);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { resetPasswordToken: 'valid-token' },
      });
    });

    it('should return null when user not found by reset token', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByResetToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findByResetToken('valid-token')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updatePassword', () => {
    it('should successfully update password and clear reset token fields', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-hashed-password' as never);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updatePassword(1, 'newpassword123');

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        password: 'new-hashed-password',
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });
    });

    it('should throw InternalServerErrorException on database error', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-hashed-password' as never);
      mockRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(service.updatePassword(1, 'newpassword123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('setResetPasswordToken', () => {
    it('should successfully set reset password token and expiration', async () => {
      const expiresAt = new Date();
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.setResetPasswordToken(1, 'reset-token', expiresAt);

      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        resetPasswordToken: 'reset-token',
        resetPasswordExpires: expiresAt,
      });
    });

    it('should throw InternalServerErrorException on database error', async () => {
      const expiresAt = new Date();
      mockRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(
        service.setResetPasswordToken(1, 'reset-token', expiresAt),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('create', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
    };

    beforeEach(() => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword' as never);
    });

    it('should successfully create a new user', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);
      mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);

      const result = await service.create(
        validUserData.email,
        validUserData.password,
        validUserData.username,
      );

      expect(result).toEqual(mockUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(validUserData.password, 10);
      expect(mockRepository.create).toHaveBeenCalledWith({
        email: validUserData.email,
        password: 'hashedpassword',
        username: validUserData.username,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
        validUserData.email,
        validUserData.username,
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.create(validUserData.email, validUserData.password, validUserData.username),
      ).rejects.toThrow(ConflictException);
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(
        service.create(validUserData.email, validUserData.password, validUserData.username),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException on password hashing error', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockRejectedValue(new Error('Hashing error') as never);

      await expect(
        service.create(validUserData.email, validUserData.password, validUserData.username),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should continue registration even if welcome email fails', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);
      mockEmailService.sendWelcomeEmail.mockRejectedValue(new Error('Email error'));

      const result = await service.create(
        validUserData.email,
        validUserData.password,
        validUserData.username,
      );

      expect(result).toEqual(mockUser);
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalled();
    });

    it('should handle empty username', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ ...mockUser, username: '' });
      mockRepository.save.mockResolvedValue({ ...mockUser, username: '' });

      const result = await service.create(validUserData.email, validUserData.password, '');

      expect(result.username).toBe('');
      expect(mockRepository.create).toHaveBeenCalledWith({
        email: validUserData.email,
        password: 'hashedpassword',
        username: '',
      });
    });

    it('should handle special characters in username', async () => {
      const specialUsername = 'test-user_123';
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ ...mockUser, username: specialUsername });
      mockRepository.save.mockResolvedValue({ ...mockUser, username: specialUsername });

      const result = await service.create(validUserData.email, validUserData.password, specialUsername);

      expect(result.username).toBe(specialUsername);
      expect(mockRepository.create).toHaveBeenCalledWith({
        email: validUserData.email,
        password: 'hashedpassword',
        username: specialUsername,
      });
    });
  });
}); 