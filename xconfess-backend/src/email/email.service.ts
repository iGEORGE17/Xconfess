  // Allow switching active version (operator action)
  setActiveTemplateVersion(key: string, version: string): void {
    const reg = this.templateRegistry?.[key];
    if (reg && reg.versions[version]) {
      reg.activeVersion = version;
      this.logger.log(`Switched ${key} template to version ${version}`);
    } else {
      throw new Error(`Template or version not found: ${key} v${version}`);
    }
  }
import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../logger/logger.service';
import {
  CircuitBreakerConfig,
  EmailProviderConfig,
  MailConfig,
  EmailTemplateRegistry,
  EmailTemplateVersion,
} from './email.config';
// Helper: Render template with variable validation
function renderTemplate(
  template: EmailTemplateVersion,
  vars: Record<string, string>
): { subject: string; html: string; text: string } {
  // Validate required variables
  for (const key of template.requiredVars) {
    if (!(key in vars)) {
      throw new Error(
        `Missing required template variable: ${key} (template: ${template.version})`
      );
    }
  }
  // Simple variable replacement
  const replaceVars = (str: string) =>
    str.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, k) => vars[k] || '');
  return {
    subject: replaceVars(template.subject),
    html: replaceVars(template.html),
    text: replaceVars(template.text),
  };
}
  // Template registry reference
  private get templateRegistry(): EmailTemplateRegistry {
    return this.configService.get('mail.templateRegistry');
  }

  // Get active template version for a key
  private getActiveTemplate(
    key: string
  ): EmailTemplateVersion | undefined {
    const reg = this.templateRegistry?.[key];
    if (!reg) return undefined;
    return reg.versions[reg.activeVersion];
  }

// ── Circuit breaker states ────────────────────────────────────────────────────

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerState {
  state: CircuitState;
  consecutiveFailures: number;
  consecutiveProbeSuccesses: number;
  openedAt: number | null; // epoch ms when circuit opened
  lastTransitionReason: string;
}

// ── Provider abstraction ──────────────────────────────────────────────────────

interface MailSendOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface TransporterEntry {
  transporter: nodemailer.Transporter;
  from: string;
  label: 'primary' | 'fallback';
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);

  private primary: TransporterEntry | null = null;
  private fallback: TransporterEntry | null = null;

  private readonly cb: CircuitBreakerState = {
    state: 'CLOSED',
    consecutiveFailures: 0,
    consecutiveProbeSuccesses: 0,
    openedAt: null,
    lastTransitionReason: 'initial',
  };

  private cbConfig: CircuitBreakerConfig = {
    failureThreshold: 3,
    cooldownSeconds: 60,
    probeSuccessThreshold: 2,
  };

  constructor(
    private readonly configService: ConfigService,
    @Optional() private readonly appLogger?: AppLogger,
  ) {}

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  onModuleInit() {
    const mailConfig = this.configService.get<EmailProviderConfig>('mail');
    const cbConfig =
      this.configService.get<CircuitBreakerConfig>('circuitBreaker');

    if (cbConfig) {
      this.cbConfig = cbConfig;
    }

    if (!mailConfig?.primary?.host) {
      this.logger.warn(
        'No primary mail config found — using Ethereal test account.',
      );
      this.initEtherealFallback();
      return;
    }

    this.primary = this.buildTransporter(mailConfig.primary, 'primary');

    if (mailConfig.fallback?.host) {
      this.fallback = this.buildTransporter(mailConfig.fallback, 'fallback');
      this.logger.log('Fallback email provider configured.');
    } else {
      this.logger.warn(
        'No fallback email provider configured. Circuit breaker will have no fallback.',
      );
    }
  }

  private buildTransporter(
    config: MailConfig,
    label: 'primary' | 'fallback',
  ): TransporterEntry {
    return {
      label,
      from: `"XConfess" <${config.from}>`,
      transporter: nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: { user: config.auth.user, pass: config.auth.pass },
      }),
    };
  }

  private initEtherealFallback(): void {
    nodemailer.createTestAccount().then((account) => {
      this.primary = {
        label: 'primary',
        from: `"XConfess" <${account.user}>`,
        transporter: nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: { user: account.user, pass: account.pass },
        }),
      };
      this.logger.log(
        'Ethereal test account ready. Preview at https://ethereal.email',
      );
    });
  }

  // ── Circuit breaker logic ────────────────────────────────────────────────────

  /**
   * Decide which provider to use for this send attempt.
   * Returns null if circuit is OPEN and still in cooldown with no fallback.
   */
  private resolveProvider(): TransporterEntry | null {
    const { state, openedAt } = this.cb;
    const { cooldownSeconds } = this.cbConfig;

    if (state === 'CLOSED') {
      return this.primary;
    }

    if (state === 'OPEN') {
      const cooldownMs = cooldownSeconds * 1000;
      const elapsed = Date.now() - (openedAt ?? 0);

      if (elapsed >= cooldownMs) {
        // Cooldown complete — allow a probe attempt through primary
        this.transitionTo('HALF_OPEN', 'cooldown_elapsed');
        return this.primary;
      }

      // Still in cooldown — route to fallback if available
      if (this.fallback) {
        return this.fallback;
      }

      return null; // No fallback; caller will throw
    }

    if (state === 'HALF_OPEN') {
      // Always probe primary during HALF_OPEN
      return this.primary;
    }

    return this.primary;
  }

  private onSendSuccess(provider: TransporterEntry): void {
    if (this.cb.state === 'HALF_OPEN') {
      this.cb.consecutiveProbeSuccesses += 1;

      if (
        this.cb.consecutiveProbeSuccesses >= this.cbConfig.probeSuccessThreshold
      ) {
        this.transitionTo(
          'CLOSED',
          `probe_success_threshold_reached provider=${provider.label}`,
        );
        this.cb.consecutiveFailures = 0;
        this.cb.consecutiveProbeSuccesses = 0;
      }
    } else if (this.cb.state === 'CLOSED') {
      // Reset failure counter on any success while closed
      this.cb.consecutiveFailures = 0;
    }
  }

  private onSendFailure(provider: TransporterEntry, error: Error): void {
    if (provider.label === 'fallback') {
      // Fallback failures don't affect primary circuit state
      this.logger.error(`Fallback provider failed: ${error.message}`);
      return;
    }

    if (this.cb.state === 'HALF_OPEN') {
      // Probe failed — re-open the circuit immediately
      this.cb.consecutiveProbeSuccesses = 0;
      this.transitionTo('OPEN', `probe_failed error=${error.message}`);
      this.cb.openedAt = Date.now();
      return;
    }

    if (this.cb.state === 'CLOSED') {
      this.cb.consecutiveFailures += 1;

      if (this.cb.consecutiveFailures >= this.cbConfig.failureThreshold) {
        this.cb.openedAt = Date.now();
        this.transitionTo(
          'OPEN',
          `failure_threshold_reached count=${this.cb.consecutiveFailures}`,
        );
      }
    }
  }

  private transitionTo(next: CircuitState, reason: string): void {
    const prev = this.cb.state;
    this.cb.state = next;
    this.cb.lastTransitionReason = reason;

    const msg = `Circuit breaker transition: ${prev} → ${next} | reason=${reason}`;

    if (next === 'OPEN') {
      this.logger.error(msg);
      this.appLogger?.incrementCounter('email_circuit_breaker_opened_total', 1);
    } else if (next === 'HALF_OPEN') {
      this.logger.warn(msg);
    } else {
      this.logger.log(msg);
      this.appLogger?.incrementCounter('email_circuit_breaker_closed_total', 1);
    }
  }

  // ── Core send ────────────────────────────────────────────────────────────────

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
    channel = 'email_generic',
    templateMeta?: { templateKey: string; templateVersion: string },
  ): Promise<void> {
    const startedAt = Date.now();
    const provider = this.resolveProvider();

    if (!provider) {
      const reason = 'circuit_open_no_fallback';
      const maskedTo = UserIdMasker.maskObject({ email: to }).email;
      this.logger.error(
        `Email blocked — circuit OPEN, no fallback. to=${maskedTo} channel=${channel}`,
      );
      this.appLogger?.incrementCounter('notification_send_failure_total', 1, {
        channel,
        outcome: 'terminal',
        reason,
      });
      throw new Error(`Email service unavailable: ${reason}`);
    }

    if (!provider.transporter) {
      this.logger.warn(
        'Email transporter not initialized yet. Email not sent.',
      );
      this.appLogger?.incrementCounter('notification_send_failure_total', 1, {
        channel,
        outcome: 'terminal',
        reason: 'transporter_not_initialized',
      });
      return;
    }

    const usingFallback = provider.label === 'fallback';
    if (usingFallback) {
      this.logger.warn(
        `Routing email via fallback provider | channel=${channel} circuit_state=${this.cb.state}`,
      );
      this.appLogger?.incrementCounter('email_fallback_send_total', 1, {
        channel,
      });
    }

    try {
      const maskedTo = UserIdMasker.maskObject({ email: to }).email;
      const maskedSubject = UserIdMasker.maskObject({ msg: subject }).msg;
      const maskedHtml = UserIdMasker.maskObject({ msg: html }).msg;
      const maskedText = UserIdMasker.maskObject({ msg: text }).msg;
      const info = await provider.transporter.sendMail({
        from: provider.from,
        to,
        subject,
        html,
        text,
      });

      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }

      this.logger.log(
        `Email sent via ${provider.label} to ${maskedTo}: ${info.messageId} | channel=${channel}` +
        (templateMeta ? ` | template=${templateMeta.templateKey}@${templateMeta.templateVersion}` : ''),
      );

      this.onSendSuccess(provider);

      this.appLogger?.incrementCounter('notification_send_success_total', 1, {
        channel,
        provider: provider.label,
      });
      this.appLogger?.observeTimer(
        'notification_send_duration_ms',
        Date.now() - startedAt,
        {
          channel,
          provider: provider.label,
        },
      );
    } catch (error) {
      const maskedTo = UserIdMasker.maskObject({ email: to }).email;
      const errorMessage =
        error instanceof Error ? UserIdMasker.maskObject({ msg: error.message }).msg : 'Unknown error';
      this.logger.error(
        `Failed to send email via ${provider.label} to ${maskedTo}: ${errorMessage} | channel=${channel}` +
        (templateMeta ? ` | template=${templateMeta.templateKey}@${templateMeta.templateVersion}` : ''),
      );

      this.onSendFailure(
        provider,
        error instanceof Error ? error : new Error(errorMessage),
      );

      this.appLogger?.incrementCounter('notification_send_failure_total', 1, {
        channel,
        outcome: 'transient',
        provider: provider.label,
      });
      this.appLogger?.observeTimer(
        'notification_send_duration_ms',
        Date.now() - startedAt,
        {
          channel,
          provider: provider.label,
        },
      );

      // If primary failed and fallback is available, retry once on fallback
      if (!usingFallback && this.fallback) {
        this.logger.warn(
          `Primary send failed — retrying on fallback | channel=${channel} error=${errorMessage}`,
        );
        return this.sendViaFallback(
          to,
          subject,
          html,
          text,
          channel,
          startedAt,
        );
      }

      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }

  /**
   * Attempt delivery directly via fallback — called when primary fails mid-send
   * and the circuit just transitioned to OPEN.
   */
  private async sendViaFallback(
    to: string,
    subject: string,
    html: string,
    text: string,
    channel: string,
    startedAt: number,
  ): Promise<void> {
    if (!this.fallback) return;

    try {
      const info = await this.fallback.transporter.sendMail({
        from: this.fallback.from,
        to,
        subject,
        html,
        text,
      });

      this.logger.log(
        `Email delivered via fallback (after primary failure) to ${to}: ${info.messageId} | channel=${channel}`,
      );
      this.appLogger?.incrementCounter('email_fallback_send_total', 1, {
        channel,
      });
      this.appLogger?.incrementCounter('notification_send_success_total', 1, {
        channel,
        provider: 'fallback',
      });
      this.appLogger?.observeTimer(
        'notification_send_duration_ms',
        Date.now() - startedAt,
        {
          channel,
          provider: 'fallback',
        },
      );
    } catch (fallbackError) {
      const msg =
        fallbackError instanceof Error
          ? fallbackError.message
          : 'Unknown error';
      this.logger.error(
        `Fallback also failed for ${to}: ${msg} | channel=${channel}`,
      );
      this.appLogger?.incrementCounter('notification_send_failure_total', 1, {
        channel,
        outcome: 'terminal',
        provider: 'fallback',
      });
      throw new Error(`Both primary and fallback failed: ${msg}`);
    }
  }

  // ── Circuit breaker diagnostics (useful for health endpoints) ────────────────

  getCircuitState(): {
    state: CircuitState;
    reason: string;
    openedAt: string | null;
  } {
    return {
      state: this.cb.state,
      reason: this.cb.lastTransitionReason,
      openedAt: this.cb.openedAt
        ? new Date(this.cb.openedAt).toISOString()
        : null,
    };
  }

  // ── Public email methods (unchanged signatures) ───────────────────────────────

  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    const templateKey = 'welcome';
    const template = this.getActiveTemplate(templateKey);
    if (!template) throw new Error('No active template for welcome');
    const vars = { username };
    const rendered = renderTemplate(template, vars);
    await this.sendEmail(
      email,
      rendered.subject,
      rendered.html,
      rendered.text,
      'email_welcome',
      { templateKey, templateVersion: template.version }
    );
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
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">
                Start Exploring
              </a>
            </div>
          </div>
          <div class="footer">
            <p>If you didn't create an account with us, please ignore this email.</p>
            <p>© ${new Date().getFullYear()} XConfess. All rights reserved.</p>
          </div>
        </body>
      </html>`;
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
    `.trim();
  }

  async sendReactionNotification(
    toEmail: string,
    username: string,
    reactorName: string,
    confessionContent: string,
    emoji: string,
  ): Promise<void> {
    const subject = `Someone reacted with ${emoji} to your confession!`;
    await this.sendEmail(
      toEmail,
      subject,
      this.generateReactionEmailTemplate(
        username,
        reactorName,
        confessionContent,
        emoji,
      ),
      this.generateReactionEmailText(
        username,
        reactorName,
        confessionContent,
        emoji,
      ),
      'email_reaction',
    );
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    username?: string,
  ): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const subject = 'Reset Your XConfess Password';
    await this.sendEmail(
      email,
      subject,
      this.generateResetEmailTemplate(username || 'User', resetUrl, token),
      this.generateResetEmailText(username || 'User', resetUrl),
      'email_password_reset',
    );
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

  private generateReactionEmailTemplate(
    username: string,
    reactorName: string,
    confessionContent: string,
    emoji: string,
  ): string {
    const truncated =
      confessionContent.length > 100
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
            <div class="confession">"${truncated}"</div>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">
                View on XConfess
              </a>
            </div>
          </div>
          <div class="footer">
            <p>You're receiving this because someone reacted to your confession on XConfess.</p>
            <p>© ${new Date().getFullYear()} XConfess. All rights reserved.</p>
          </div>
        </body>
      </html>`;
  }

  private generateReactionEmailText(
    username: string,
    reactorName: string,
    confessionContent: string,
    emoji: string,
  ): string {
    const truncated =
      confessionContent.length > 100
        ? `${confessionContent.substring(0, 100)}...`
        : confessionContent;

    return `
New Reaction to Your Confession! ${emoji}

Hello ${username},

${reactorName} reacted with ${emoji} to your confession:

"${truncated}"

View it on XConfess: ${process.env.FRONTEND_URL || 'http://localhost:3000'}

You're receiving this because someone reacted to your confession on XConfess.
© ${new Date().getFullYear()} XConfess. All rights reserved.
    `.trim();
  }

  private generateResetEmailTemplate(
    username: string,
    resetUrl: string,
    token: string,
  ): string {
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
              <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
              <p>For security purposes, your reset token is: <code>${token}</code></p>
            </div>
            <div class="footer">
              <p>This is an automated message from XConfess. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>`;
  }

  private generateResetEmailText(username: string, resetUrl: string): string {
    return `
Hello ${username},

We received a request to reset your password for your XConfess account.

To reset your password, please visit the following link:
${resetUrl}

This link will expire in 15 minutes for security purposes.

If you didn't request this password reset, please ignore this email.

Best regards,
The XConfess Team

This is an automated message. Please do not reply to this email.
    `.trim();
  }
}
