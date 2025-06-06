import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'test@example.com',
        pass: 'password123',
      },
      from: 'test@example.com',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      const email = 'test@example.com';
      const token = 'reset-token-123';
      const username = 'testuser';

      await service.sendPasswordResetEmail(email, token, username);

      // Add assertions here to verify the email was sent correctly
      // This might involve checking if the sendEmail method was called with correct parameters
    });

    it('should send email with default username when not provided', async () => {
      const email = 'test@example.com';
      const token = 'reset-token-123';

      await service.sendPasswordResetEmail(email, token);

      // Add assertions here to verify the email was sent with default username
    });

    it('should generate proper email content with username', async () => {
      const email = 'test@example.com';
      const token = 'reset-token-123';
      const username = 'testuser';

      await service.sendPasswordResetEmail(email, token, username);

      // Add assertions here to verify the email content
    });

    it('should generate proper text email content', async () => {
      const email = 'test@example.com';
      const token = 'reset-token-123';
      const username = 'testuser';

      await service.sendPasswordResetEmail(email, token, username);

      // Add assertions here to verify the text email content
    });

    it('should use frontend URL from environment', async () => {
      const email = 'test@example.com';
      const token = 'reset-token-123';
      const username = 'testuser';
      process.env.FRONTEND_URL = 'https://example.com';

      await service.sendPasswordResetEmail(email, token, username);

      // Add assertions here to verify the frontend URL is used correctly
    });

    it('should handle errors and throw appropriate error message', async () => {
      const email = 'test@example.com';
      const token = 'reset-token-123';
      const username = 'testuser';

      // Mock the sendEmail method to throw an error
      jest.spyOn(service as any, 'sendEmail').mockRejectedValue(new Error('Failed to send email'));

      await expect(service.sendPasswordResetEmail(email, token, username)).rejects.toThrow('Failed to send email');
    });
  });
}); 