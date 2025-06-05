import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    username?: string,
  ): Promise<void> {
    try {
      // In a production environment, you would integrate with an email provider
      // like SendGrid, AWS SES, Nodemailer, etc.
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      const emailContent = {
        to: email,
        subject: 'Password Reset Request - XConfess',
        html: this.generateResetEmailTemplate(username || 'User', resetUrl, resetToken),
        text: this.generateResetEmailText(username || 'User', resetUrl),
      };

      // For development purposes, we'll log the email content
      // In production, replace this with actual email sending logic
      this.logger.log(`Password reset email prepared for: ${email}`);
      this.logger.debug(`Email content: ${JSON.stringify(emailContent, null, 2)}`);

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 100));

      this.logger.log(`Password reset email sent successfully to: ${email}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send password reset email to ${email}: ${errorMessage}`);
      throw new Error(`Failed to send password reset email: ${errorMessage}`);
    }
  }

  private generateResetEmailTemplate(username: string, resetUrl: string, token: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - XConfess</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #007bff; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>XConfess - Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello ${username},</h2>
            <p>We received a request to reset your password for your XConfess account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset My Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p><strong>This link will expire in 15 minutes for security purposes.</strong></p>
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>For security purposes, your reset token is: <code>${token}</code></p>
          </div>
          <div class="footer">
            <p>This is an automated message from XConfess. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateResetEmailText(username: string, resetUrl: string): string {
    return `
Hello ${username},

We received a request to reset your password for your XConfess account.

To reset your password, please visit the following link:
${resetUrl}

This link will expire in 15 minutes for security purposes.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

Best regards,
The XConfess Team

This is an automated message. Please do not reply to this email.
    `.trim();
  }
} 