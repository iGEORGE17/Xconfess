import { registerAs } from '@nestjs/config';

// Template registry structure
export interface EmailTemplateVersion {
  version: string;
  subject: string;
  html: string;
  text: string;
  requiredVars: string[];
  lifecycleState: 'draft' | 'canary' | 'active' | 'deprecated' | 'archived';
}

export interface EmailTemplateRollout {
  canaryVersion?: string;
  canaryWeight?: number; // 0-100
  killSwitchEnabled?: boolean;
}

export interface EmailTemplateRegistry {
  [templateKey: string]: {
    activeVersion: string;
    versions: Record<string, EmailTemplateVersion>;
    rollout?: EmailTemplateRollout;
  };
}

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  testAccount?: {
    user?: string;
    pass?: string;
  };
}

export interface EmailProviderConfig {
  primary: MailConfig;
  fallback?: MailConfig;
  globalKillSwitch: boolean;
  templateRegistry: EmailTemplateRegistry;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  cooldownSeconds: number;
  probeSuccessThreshold: number;
}

// Example registry (should be loaded from DB or config in production)
const templateRegistry: EmailTemplateRegistry = {
  welcome: {
    activeVersion: 'v1',
    versions: {
      v1: {
        version: 'v1',
        subject: 'Welcome to XConfess! 🎉',
        html: '<h1>Welcome, {{username}}!</h1>',
        text: 'Welcome, {{username}}!',
        requiredVars: ['username'],
        lifecycleState: 'active',
      },
      v2: {
        version: 'v2',
        subject: 'Hello from XConfess!',
        html: '<h1>Hello, {{username}}! Enjoy XConfess.</h1>',
        text: 'Hello, {{username}}! Enjoy XConfess.',
        requiredVars: ['username'],
        lifecycleState: 'canary',
      },
    },
  },
};

export const mailConfig = registerAs('mail', () => ({
  primary: {
    host: process.env.MAIL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER || '',
      pass: process.env.MAIL_PASSWORD || '',
    },
    from: process.env.MAIL_FROM || 'noreply@xconfess.app',
    testAccount: {
      user: process.env.MAIL_TEST_USER,
      pass: process.env.MAIL_TEST_PASS,
    },
  },
  templateRegistry,
  globalKillSwitch: process.env.EMAIL_ROLLOUT_KILLSWITCH === 'true',
}));

export const circuitBreakerConfig = registerAs('circuitBreaker', () => ({
  failureThreshold: parseInt(process.env.CB_FAILURE_THRESHOLD || '3', 10),
  cooldownSeconds: parseInt(process.env.CB_COOLDOWN_SECONDS || '60', 10),
  probeSuccessThreshold: parseInt(process.env.CB_PROBE_SUCCESS_THRESHOLD || '2', 10),
}));
