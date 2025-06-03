import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { User } from './entities/user.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let authService: AuthService;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      const { password, ...expectedResult } = mockUser;
      const result = await controller.getProfile(mockUser);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('register', () => {
    it('should create a new user', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue(mockUser);

      const result = await controller.register({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      });

      const { password, ...expectedResult } = mockUser;
      expect(result).toEqual(expectedResult);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        controller.register({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const mockResponse = {
        access_token: 'mock-token',
        user: { ...mockUser, password: undefined },
      };
      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockResponse);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException());

      await expect(
        controller.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
}); 