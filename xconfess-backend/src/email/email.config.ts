export interface MailAuth {
  user: string;
  pass: string;
}

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  from: string;
  auth: MailAuth;
}

export interface EmailProviderConfig {
  primary: MailConfig;
  fallback?: MailConfig; // optional — fallback only active if configured
}

export interface CircuitBreakerConfig {
  // How many consecutive failures open the circuit
  failureThreshold: number;
  // Seconds to wait in OPEN state before allowing a probe attempt
  cooldownSeconds: number;
  // How many consecutive successes in HALF_OPEN close the circuit
  probeSuccessThreshold: number;
}

export const emailConfig = (): {
  mail: EmailProviderConfig;
  circuitBreaker: CircuitBreakerConfig;
} => ({
  mail: {
    primary: {
      host: process.env.MAIL_HOST ?? '',
      port: parseInt(process.env.MAIL_PORT ?? '587', 10),
      secure: process.env.MAIL_SECURE === 'true',
      from: process.env.MAIL_FROM ?? '',
      auth: {
        user: process.env.MAIL_USER ?? '',
        pass: process.env.MAIL_PASS ?? '',
      },
    },
    fallback: process.env.FALLBACK_MAIL_HOST
      ? {
          host: process.env.FALLBACK_MAIL_HOST,
          port: parseInt(process.env.FALLBACK_MAIL_PORT ?? '587', 10),
          secure: process.env.FALLBACK_MAIL_SECURE === 'true',
          from: process.env.FALLBACK_MAIL_FROM ?? '',
          auth: {
            user: process.env.FALLBACK_MAIL_USER ?? '',
            pass: process.env.FALLBACK_MAIL_PASS ?? '',
          },
        }
      : undefined,
  },
  circuitBreaker: {
    failureThreshold: parseInt(process.env.CB_FAILURE_THRESHOLD ?? '3', 10),
    cooldownSeconds: parseInt(process.env.CB_COOLDOWN_SECONDS ?? '60', 10),
    probeSuccessThreshold: parseInt(
      process.env.CB_PROBE_SUCCESS_THRESHOLD ?? '2',
      10,
    ),
  },
});
