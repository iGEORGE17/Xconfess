import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../logger/logger.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import {
  CircuitBreakerConfig,
  EmailProviderConfig,
  MailConfig,
  EmailTemplateVersion,
  EmailTemplateRegistry,
} from '../config/email.config';

// ── Template rendering ────────────────────────────────────────────────────────

function renderTemplate(
  template: EmailTemplateVersion,
  vars: Record<string, string>,
): { subject: string; html: string; text: string } {
  for (const key of template.requiredVars) {
    if (!(key in vars)) {
      throw new Error(
        `Missing required template variable: ${key} (template: ${template.version})`,
      );
    }
  }
  const replaceVars = (str: string) =>
    str.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, k) => vars[k] ?? '');
  return {
    subject: replaceVars(template.subject),
    html: replaceVars(template.html),
    text: replaceVars(template.text),
  };
}

// ── Circuit breaker types ─────────────────────────────────────────────────────

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerState {
  state: CircuitState;
  consecutiveFailures: number;
  consecutiveProbeSuccesses: number;
  openedAt: number | null;
  lastTransitionReason: string;
}

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

// ── Template meta attached to each send ──────────────────────────────────────

export interface TemplateMeta {
  templateKey: string;
  templateVersion: string;
  isCanary: boolean;
}

// ── Preview types ─────────────────────────────────────────────────────────────

export interface TemplatePreviewResult {
  templateKey: string;
  version: string;
  lifecycleState: string;
  rendered: {
    subject: string;
    html: string;
    text: string;
  } | null;
  validationErrors: string[];
  missingVars: string[];
  requiredVars: string[];
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
    private readonly auditLogService: AuditLogService,
    @Optional() private readonly appLogger?: AppLogger,
  ) {}

  // ── Template registry ─────────────────────────────────────────────────────

  private get templateRegistry(): EmailTemplateRegistry {
    return (
      this.configService.get<EmailTemplateRegistry>('mail.templateRegistry') ||
      {}
    );
  }

  // ── Template Management ───────────────────────────────────────────────────

  private readonly validTransitions: Record<string, string[]> = {
    draft: ['canary', 'active', 'archived'],
    canary: ['active', 'deprecated', 'archived'],
    active: ['deprecated', 'archived'],
    deprecated: ['active', 'archived'],
    archived: ['draft'],
  };

  async transitionTemplateState(
    templateKey: string,
    version: string,
    nextState: 'draft' | 'canary' | 'active' | 'deprecated' | 'archived',
    adminId: string,
    reason?: string,
  ): Promise<void> {
    const reg = this.templateRegistry?.[templateKey];
    const template = reg?.versions[version];

    if (!template) {
      throw new Error(`Template version not found: ${templateKey} v${version}`);
    }

    const currentState = template.lifecycleState;
    const allowed = this.validTransitions[currentState] || [];

    if (!allowed.includes(nextState)) {
      throw new Error(
        `Invalid transition: ${currentState} -> ${nextState} for ${templateKey} v${version}`,
      );
    }

    template.lifecycleState = nextState;

    await this.auditLogService.logTemplateStateTransition(
      templateKey,
      version,
      currentState,
      nextState,
      adminId,
      reason,
    );

    this.logger.log(
      `Template ${templateKey} v${version} transitioned: ${currentState} -> ${nextState} (by admin ${adminId})`,
    );
  }

  setActiveTemplateVersion(templateKey: string, version: string): void {
    const reg = this.templateRegistry?.[templateKey];
    if (reg && reg.versions[version]) {
      reg.activeVersion = version;
      this.logger.log(`Switched ${templateKey} template to version ${version}`);
    } else {
      throw new Error(
        `Template or version not found: ${templateKey} v${version}`,
      );
    }
  }

  // ── Template resolution ───────────────────────────────────────────────────

  private resolveTemplate(
    key: string,
  ): { template: EmailTemplateVersion; isCanary: boolean } | undefined {
    const reg = this.templateRegistry?.[key];
    if (!reg) return undefined;

    const globalKillSwitch = this.configService.get<boolean>(
      'mail.globalKillSwitch',
    );
    const localKillSwitch = reg.rollout?.killSwitchEnabled === true;
    const isKillSwitchActive = globalKillSwitch || localKillSwitch;

    const activeVersion = reg.versions[reg.activeVersion];
    const canaryVersionKey = reg.rollout?.canaryVersion;
    const canaryVersion = canaryVersionKey
      ? reg.versions[canaryVersionKey]
      : undefined;

    if (isKillSwitchActive) {
      if (canaryVersion) {
        this.logger.warn(
          `Kill-switch active for ${key}: forcing fallback from canary ${canaryVersionKey} to active ${reg.activeVersion}`,
        );
        this.auditLogService
          .logTemplateFallbackActivated(
            key,
            canaryVersionKey || 'unknown',
            reg.activeVersion,
            globalKillSwitch ? 'global_killswitch' : 'local_killswitch',
          )
          .catch(() => undefined);
      }
      return activeVersion
        ? { template: activeVersion, isCanary: false }
        : undefined;
    }

    if (canaryVersion && canaryVersion.lifecycleState === 'canary') {
      const weight = reg.rollout?.canaryWeight ?? 0;
      const dice = Math.random() * 100;
      if (dice < weight) {
        return { template: canaryVersion, isCanary: true };
      }
    }

    if (activeVersion && activeVersion.lifecycleState === 'active') {
      return { template: activeVersion, isCanary: false };
    }

    if (activeVersion) {
      this.logger.warn(
        `Template ${key} active version ${reg.activeVersion} is in state ${activeVersion.lifecycleState}`,
      );
      return { template: activeVersion, isCanary: false };
    }

    return undefined;
  }

  // ── Admin: Template Preview ───────────────────────────────────────────────

  /**
   * Preview a template by key and optional version with sample variables.
   * Uses the same renderTemplate path as production sends.
   * NEVER dispatches email or enqueues a job.
   *
   * @param templateKey  - Key of the registered template (e.g. "welcome")
   * @param vars         - Sample variable map to render with
   * @param version      - Optional specific version; defaults to activeVersion
   */
  previewTemplate(
    templateKey: string,
    vars: Record<string, string>,
    version?: string,
  ): TemplatePreviewResult {
    const registry = this.templateRegistry;
    const reg = registry[templateKey];

    // Unknown template key
    if (!reg) {
      return {
        templateKey,
        version: version ?? 'unknown',
        lifecycleState: 'unknown',
        rendered: null,
        validationErrors: [
          `Template key "${templateKey}" is not registered. Available keys: ${Object.keys(registry).join(', ') || 'none'}`,
        ],
        missingVars: [],
        requiredVars: [],
      };
    }

    // Resolve which version to preview
    const resolvedVersionKey = version ?? reg.activeVersion;
    const template = reg.versions[resolvedVersionKey];

    // Unknown version
    if (!template) {
      const availableVersions = Object.keys(reg.versions).join(', ');
      return {
        templateKey,
        version: resolvedVersionKey,
        lifecycleState: 'unknown',
        rendered: null,
        validationErrors: [
          `Version "${resolvedVersionKey}" not found for template "${templateKey}". Available versions: ${availableVersions}`,
        ],
        missingVars: [],
        requiredVars: [],
      };
    }

    // Validate variables — collect ALL missing vars before returning
    const missingVars = template.requiredVars.filter((v) => !(v in vars));

    if (missingVars.length > 0) {
      return {
        templateKey,
        version: resolvedVersionKey,
        lifecycleState: template.lifecycleState,
        rendered: null,
        validationErrors: missingVars.map(
          (v) =>
            `Missing required variable: "${v}" — provide a sample value to preview this template`,
        ),
        missingVars,
        requiredVars: template.requiredVars,
      };
    }

    // Render using the production path
    try {
      const rendered = renderTemplate(template, vars);
      this.logger.log(
        `[preview] Template "${templateKey}" v${resolvedVersionKey} rendered successfully (no email sent)`,
      );
      return {
        templateKey,
        version: resolvedVersionKey,
        lifecycleState: template.lifecycleState,
        rendered,
        validationErrors: [],
        missingVars: [],
        requiredVars: template.requiredVars,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        templateKey,
        version: resolvedVersionKey,
        lifecycleState: template.lifecycleState,
        rendered: null,
        validationErrors: [message],
        missingVars: [],
        requiredVars: template.requiredVars,
      };
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  onModuleInit() {
    const mailConfig = this.configService.get<EmailProviderConfig>('mail');
    const cbConfig =
      this.configService.get<CircuitBreakerConfig>('circuitBreaker');

    if (cbConfig) this.cbConfig = cbConfig;

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

  // ── Provider helpers ──────────────────────────────────────────────────────

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

  // ── Circuit breaker ───────────────────────────────────────────────────────

  private resolveProvider(): TransporterEntry | null {
    const { state, openedAt } = this.cb;
    const { cooldownSeconds } = this.cbConfig;

    if (state === 'CLOSED') return this.primary;

    if (state === 'OPEN') {
      const elapsed = Date.now() - (openedAt ?? 0);
      if (elapsed >= cooldownSeconds * 1000) {
        this.transitionTo('HALF_OPEN', 'cooldown_elapsed');
        return this.primary;
      }
      return this.fallback ?? null;
    }

    if (state === 'HALF_OPEN') return this.primary;

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
      this.cb.consecutiveFailures = 0;
    }
  }

  private onSendFailure(provider: TransporterEntry, error: Error): void {
    if (provider.label === 'fallback') {
      this.logger.error(`Fallback provider failed: ${error.message}`);
      return;
    }

    if (this.cb.state === 'HALF_OPEN') {
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

  // ── Core send ─────────────────────────────────────────────────────────────

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
    channel = 'email_generic',
    templateMeta?: TemplateMeta,
  ): Promise<void> {
    const startedAt = Date.now();
    const provider = this.resolveProvider();

    const versionLabel = templateMeta
      ? `${templateMeta.templateKey}@${templateMeta.templateVersion}${
          templateMeta.isCanary ? '[canary]' : ''
        }`
      : undefined;

    if (!provider) {
      throw new Error('Email service unavailable (circuit open)');
    }

    try {
      const info = await provider.transporter.sendMail({
        from: provider.from,
        to,
        subject,
        html,
        text,
      });

      this.onSendSuccess(provider);

      this.appLogger?.incrementCounter('notification_send_success_total', 1, {
        channel,
        provider: provider.label,
        ...(templateMeta && {
          template_key: templateMeta.templateKey,
          template_version: templateMeta.templateVersion,
          is_canary: String(templateMeta.isCanary),
        }),
      });

      this.appLogger?.observeTimer(
        'notification_send_duration_ms',
        Date.now() - startedAt,
        { channel, provider: provider.label },
      );

      if (templateMeta) {
        await this.auditLogService?.log({
          actionType: 'EMAIL_TEMPLATE_DELIVERED' as any,
          metadata: {
            templateKey: templateMeta.templateKey,
            templateVersion: templateMeta.templateVersion,
            isCanary: templateMeta.isCanary,
            provider: provider.label,
            channel,
            deliveredAt: new Date().toISOString(),
          },
        });
      }

      this.logger.log(
        `Email sent via ${provider.label} to ${to} | channel=${channel}` +
          (versionLabel ? ` | template=${versionLabel}` : ''),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.onSendFailure(
        provider,
        error instanceof Error ? error : new Error(errorMessage),
      );

      this.appLogger?.incrementCounter('notification_send_failure_total', 1, {
        channel,
        provider: provider.label,
        outcome: 'transient',
        ...(templateMeta && {
          template_key: templateMeta.templateKey,
          template_version: templateMeta.templateVersion,
          is_canary: String(templateMeta.isCanary),
        }),
      });

      this.appLogger?.observeTimer(
        'notification_send_duration_ms',
        Date.now() - startedAt,
        { channel, provider: provider.label },
      );

      if (templateMeta) {
        await this.auditLogService?.log({
          actionType: 'EMAIL_TEMPLATE_FAILED' as any,
          metadata: {
            templateKey: templateMeta.templateKey,
            templateVersion: templateMeta.templateVersion,
            isCanary: templateMeta.isCanary,
            provider: provider.label,
            channel,
            error: errorMessage,
            failedAt: new Date().toISOString(),
          },
        });
      }

      throw error;
    }
  }

  // ── Circuit breaker diagnostics ───────────────────────────────────────────

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

  // ── Public email methods ──────────────────────────────────────────────────

  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    const templateKey = 'welcome';
    const resolved = this.resolveTemplate(templateKey);
    if (!resolved) throw new Error('No valid template for welcome');

    const { template, isCanary } = resolved;
    const rendered = renderTemplate(template, { username });
    await this.sendEmail(
      email,
      rendered.subject,
      rendered.html,
      rendered.text,
      'email_welcome',
      {
        templateKey,
        templateVersion: template.version,
        isCanary,
      },
    );
  }

  async sendReactionNotification(
    toEmail: string,
    username: string,
    reactorName: string,
    confessionContent: string,
    emoji: string,
  ): Promise<void> {
    const templateKey = 'reaction_notification';
    const resolved = this.resolveTemplate(templateKey);

    if (resolved) {
      const { template, isCanary } = resolved;
      const vars = { username, reactorName, emoji, confessionContent };
      const rendered = renderTemplate(template, vars);
      await this.sendEmail(
        toEmail,
        rendered.subject,
        rendered.html,
        rendered.text,
        'email_reaction',
        { templateKey, templateVersion: template.version, isCanary },
      );
    } else {
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
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    username?: string,
  ): Promise<void> {
    const templateKey = 'password_reset';
    const resolved = this.resolveTemplate(templateKey);
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    if (resolved) {
      const { template, isCanary } = resolved;
      const vars = { username: username || 'User', resetUrl, token };
      const rendered = renderTemplate(template, vars);
      await this.sendEmail(
        email,
        rendered.subject,
        rendered.html,
        rendered.text,
        'email_password_reset',
        { templateKey, templateVersion: template.version, isCanary },
      );
    } else {
      const subject = 'Reset Your XConfess Password';
      await this.sendEmail(
        email,
        subject,
        this.generateResetEmailTemplate(username || 'User', resetUrl, token),
        this.generateResetEmailText(username || 'User', resetUrl),
        'email_password_reset',
      );
    }
  }

  async sendCommentNotification(
    data: {
      to: string;
      confessionId: string;
      commentPreview: string;
    },
    templateMeta?: TemplateMeta,
  ): Promise<void> {
    const { to, confessionId, commentPreview } = data;
    const templateKey = 'comment_notification';
    const resolved = this.resolveTemplate(templateKey);

    if (resolved) {
      const { template, isCanary } = resolved;
      const vars = {
        confessionId,
        commentPreview,
        frontendUrl:
          this.configService.get('FRONTEND_URL') || 'http://localhost:3000',
      };
      const rendered = renderTemplate(template, vars);
      await this.sendEmail(
        to,
        rendered.subject,
        rendered.html,
        rendered.text,
        'email_comment_notification',
        { templateKey, templateVersion: template.version, isCanary },
      );
    } else {
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
      await this.sendEmail(
        to,
        subject,
        html,
        '',
        'email_comment_notification',
        templateMeta,
      );
    }
  }

  // ── Legacy template generators ────────────────────────────────────────────

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

    return `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .emoji { font-size: 24px; margin: 0 5px; }
      .confession { background-color: #fff; border-left: 4px solid #4CAF50; padding: 10px 15px; margin: 15px 0; font-style: italic; }
      .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    </style>
  </head>
  <body>
    <h1>New Reaction! <span class="emoji">${emoji}</span></h1>
    <p>Hello ${username},</p>
    <p><strong>${reactorName}</strong> reacted with ${emoji} to your confession:</p>
    <div class="confession">"${truncated}"</div>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">View on XConfess</a>
    <p style="font-size:12px;color:#777;">&copy; ${new Date().getFullYear()} XConfess. All rights reserved.</p>
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
    return `New Reaction! ${emoji}\n\nHello ${username},\n\n${reactorName} reacted with ${emoji} to your confession:\n\n"${truncated}"\n\nView on XConfess: ${process.env.FRONTEND_URL || 'http://localhost:3000'}\n\n© ${new Date().getFullYear()} XConfess.`;
  }

  private generateResetEmailTemplate(
    username: string,
    resetUrl: string,
    token: string,
  ): string {
    return `<!DOCTYPE html>
<html>
  <body>
    <h2>Hello ${username},</h2>
    <p>We received a request to reset your password.</p>
    <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#007bff;color:white;text-decoration:none;border-radius:5px;">Reset My Password</a>
    <p>Or copy: <a href="${resetUrl}">${resetUrl}</a></p>
    <p><strong>This link expires in 15 minutes.</strong></p>
    <p>Reset token: <code>${token}</code></p>
  </body>
</html>`;
  }

  private generateResetEmailText(username: string, resetUrl: string): string {
    return `Hello ${username},\n\nReset your password: ${resetUrl}\n\nThis link expires in 15 minutes.`;
  }
}
