import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      const email = 'test@example.com';
      const resetToken = 'test-token-123';
      const username = 'testuser';

      // Mock the logger to capture log calls
      const loggerSpy = jest.spyOn(service['logger'], 'log');

      await service.sendPasswordResetEmail(email, resetToken, username);

      expect(loggerSpy).toHaveBeenCalledWith(`Password reset email prepared for: ${email}`);
      expect(loggerSpy).toHaveBeenCalledWith(`Password reset email sent successfully to: ${email}`);
    });

    it('should send email with default username when not provided', async () => {
      const email = 'test@example.com';
      const resetToken = 'test-token-123';

      const loggerSpy = jest.spyOn(service['logger'], 'log');

      await service.sendPasswordResetEmail(email, resetToken);

      expect(loggerSpy).toHaveBeenCalledWith(`Password reset email prepared for: ${email}`);
      expect(loggerSpy).toHaveBeenCalledWith(`Password reset email sent successfully to: ${email}`);
    });

    it('should generate proper email content with username', () => {
      const username = 'testuser';
      const resetUrl = 'http://localhost:3000/reset-password?token=test-token';
      const token = 'test-token';

      const emailHtml = service['generateResetEmailTemplate'](username, resetUrl, token);

      expect(emailHtml).toContain(`Hello ${username},`);
      expect(emailHtml).toContain(resetUrl);
      expect(emailHtml).toContain(token);
      expect(emailHtml).toContain('XConfess - Password Reset');
      expect(emailHtml).toContain('15 minutes');
    });

    it('should generate proper text email content', () => {
      const username = 'testuser';
      const resetUrl = 'http://localhost:3000/reset-password?token=test-token';

      const emailText = service['generateResetEmailText'](username, resetUrl);

      expect(emailText).toContain(`Hello ${username},`);
      expect(emailText).toContain(resetUrl);
      expect(emailText).toContain('15 minutes');
      expect(emailText).toContain('XConfess Team');
    });

    it('should use frontend URL from environment', async () => {
      const originalEnv = process.env.FRONTEND_URL;
      process.env.FRONTEND_URL = 'https://myapp.com';

      const loggerDebugSpy = jest.spyOn(service['logger'], 'debug');
      
      await service.sendPasswordResetEmail('test@example.com', 'token123');

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://myapp.com/reset-password?token=token123')
      );

      // Restore original env
      process.env.FRONTEND_URL = originalEnv;
    });

    it('should handle errors and throw appropriate error message', async () => {
      // Force an error by mocking the Promise constructor to throw
      const originalPromise = global.Promise;
      
      // Mock Promise to throw an error
      const mockPromise = jest.fn().mockImplementation(() => {
        throw new Error('Timeout error');
      });
      
      // Replace global Promise temporarily
      (global as any).Promise = mockPromise;

      await expect(
        service.sendPasswordResetEmail('test@example.com', 'token123')
      ).rejects.toThrow('Failed to send password reset email: Timeout error');

      // Restore original Promise
      global.Promise = originalPromise;
    });
  });
}); 