import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { MailConfig } from '../config/email.config';
import { AppLogger } from '../logger/logger.service';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(
    private configService: ConfigService,
    @Optional() private readonly appLogger?: AppLogger,
  ) {}

  onModuleInit() {
    const mailConfig = this.configService.get<MailConfig>('mail');
    
    // Use a test account if no mail config is provided (for development)
    if (!mailConfig?.host) {
      this.logger.warn('No mail configuration found. Using ethereal.email test account.');
      nodemailer.createTestAccount().then(testAccount => {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        this.from = `"XConfess" <${testAccount.user}>`;
        this.logger.log(`Ethereal test account created. Preview URL: https://ethereal.email`);
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host: mailConfig.host,
        port: mailConfig.port,
        secure: mailConfig.secure,
        auth: {
          user: mailConfig.auth.user,
          pass: mailConfig.auth.pass,
        },
      });
      this.from = `"XConfess" <${mailConfig.from}>`;
    }
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
    channel = 'email_generic',
  ): Promise<void> {
    const startedAt = Date.now();
    if (!this.transporter) {
      this.logger.warn('Email transporter not initialized yet. Email not sent.');
      this.appLogger?.incrementCounter('notification_send_failure_total', 1, {
        channel,
        outcome: 'terminal',
        reason: 'transporter_not_initialized',
      });
      return;
    }

    try {
      const mailOptions = {
        from: this.from,
        to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      
      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      this.appLogger?.incrementCounter('notification_send_success_total', 1, {
        channel,
      });
      this.appLogger?.observeTimer(
        'notification_send_duration_ms',
        Date.now() - startedAt,
        { channel },
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send email to ${to}: ${errorMessage}`);
      this.appLogger?.incrementCounter('notification_send_failure_total', 1, {
        channel,
        outcome: 'transient',
      });
      this.appLogger?.observeTimer(
        'notification_send_duration_ms',
        Date.now() - startedAt,
        { channel },
      );
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }

  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    const subject = 'Welcome to XConfess! 🎉';
    const html = this.generateWelcomeEmailTemplate(username);
    const text = this.generateWelcomeEmailText(username);
    
    await this.sendEmail(email, subject, html, text, 'email_welcome');
  }

  async sendReactionNotification(
    toEmail: string,
    username: string,
    reactorName: string,
    confessionContent: string,
    emoji: string,
  ): Promise<void> {
    const subject = `Someone reacted with ${emoji} to your confession!`;
    const html = this.generateReactionEmailTemplate(username, reactorName, confessionContent, emoji);
    const text = this.generateReactionEmailText(username, reactorName, confessionContent, emoji);
    
    await this.sendEmail(toEmail, subject, html, text, 'email_reaction');
  }

  async sendPasswordResetEmail(email: string, token: string, username?: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const subject = 'Reset Your XConfess Password';
    const html = this.generateResetEmailTemplate(username || 'User', resetUrl, token);
    const text = this.generateResetEmailText(username || 'User', resetUrl);
    
    await this.sendEmail(email, subject, html, text, 'email_password_reset');
  }

  async sendCommentNotification(data: {
    to: string;
    confessionId: string;
    commentPreview: string;
  }): Promise<void> {
    const { to, confessionId, commentPreview } = data;

    const subject = 'New Comment on Your Confession';
    const html = `
      <h2>Someone commented on your confession!</h2>
      <p>Here's a preview of the comment:</p>
      <blockquote>${commentPreview}</blockquote>
      <p>Click the link below to view the full comment:</p>
      <a href="${this.configService.get('FRONTEND_URL')}/confessions/${confessionId}">
        View Confession
      </a>
    `;

    await this.sendEmail(to, subject, html, '', 'email_comment_notification');
  }

  private generateWelcomeEmailTemplate(username: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; }
            .button {
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #4CAF50; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px; 
              margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to XConfess, ${username}! 🎉</h1>
          </div>
          
          <div class="content">
            <p>Hello ${username},</p>
            
            <p>Thank you for joining XConfess! We're excited to have you on board.</p>
            
            <p>With XConfess, you can:</p>
            <ul>
              <li>Share your thoughts and confessions anonymously</li>
              <li>React to others' confessions with emojis</li>
              <li>Connect with a community of like-minded individuals</li>
            </ul>
            
            <p>Get started by exploring the latest confessions or share your own!</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Start Exploring</a>
            </div>
          </div>
          
          <div class="footer">
            <p>If you didn't create an account with us, please ignore this email.</p>
            <p>© ${new Date().getFullYear()} XConfess. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;
  }

  private generateWelcomeEmailText(username: string): string {
    return `
Welcome to XConfess, ${username}! 🎉

Thank you for joining XConfess! We're excited to have you on board.

With XConfess, you can:
- Share your thoughts and confessions anonymously
- React to others' confessions with emojis
- Connect with a community of like-minded individuals

Get started by exploring the latest confessions or share your own!

${process.env.FRONTEND_URL || 'http://localhost:3000'}

If you didn't create an account with us, please ignore this email.

© ${new Date().getFullYear()} XConfess. All rights reserved.
    `;
  }

  private generateReactionEmailTemplate(
    username: string,
    reactorName: string,
    confessionContent: string,
    emoji: string
  ): string {
    const truncatedContent = confessionContent.length > 100 
      ? `${confessionContent.substring(0, 100)}...` 
      : confessionContent;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; }
            .emoji { font-size: 24px; margin: 0 5px; }
            .confession { 
              background-color: #fff; 
              border-left: 4px solid #4CAF50; 
              padding: 10px 15px; 
              margin: 15px 0;
              font-style: italic;
            }
            .button {
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #4CAF50; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px; 
              margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>New Reaction to Your Confession! <span class="emoji">${emoji}</span></h1>
          </div>
          
          <div class="content">
            <p>Hello ${username},</p>
            
            <p><strong>${reactorName}</strong> reacted with ${emoji} to your confession:</p>
            
            <div class="confession">
              "${truncatedContent}"
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">View on XConfess</a>
            </div>
          </div>
          
          <div class="footer">
            <p>You're receiving this email because someone reacted to your confession on XConfess.</p>
            <p>© ${new Date().getFullYear()} XConfess. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;
  }

  private generateReactionEmailText(
    username: string,
    reactorName: string,
    confessionContent: string,
    emoji: string
  ): string {
    const truncatedContent = confessionContent.length > 100 
      ? `${confessionContent.substring(0, 100)}...` 
      : confessionContent;

    return `
New Reaction to Your Confession! ${emoji}

Hello ${username},

${reactorName} reacted with ${emoji} to your confession:

"${truncatedContent}"

View it on XConfess: ${process.env.FRONTEND_URL || 'http://localhost:3000'}

You're receiving this email because someone reacted to your confession on XConfess.

© ${new Date().getFullYear()} XConfess. All rights reserved.
    `;
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
