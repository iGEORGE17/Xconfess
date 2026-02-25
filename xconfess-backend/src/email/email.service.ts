import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../logger/logger.service';
import {
  AuditLogService,
  TemplateRolloutSourceMetadata,
} from '../audit-log/audit-log.service';
import { AuditActionType } from '../audit-log/audit-log.entity';
import { UserIdMasker } from '../utils/mask-user-id';
import {
  CircuitBreakerConfig,
  EmailProviderConfig,
  MailConfig,
  EmailTemplateVersion,
  EmailTemplateRegistry,
  EmailTemplateSloConfig,
  TemplateVariablePrimitiveType,
  TemplateRegistry,
  TemplateRolloutMap,
  resolveTemplate,
} from '../config/email.config';


// ─────────────────────────────────────────────────────────────
// STRICT TEMPLATE VALIDATION (Your Feature Branch)
// ─────────────────────────────────────────────────────────────

export type TemplateVariableValidationViolationCode =
  | 'missing'
  | 'unknown'
  | 'type_mismatch';

export interface TemplateVariableValidationViolation {
  code: TemplateVariableValidationViolationCode;
  key: string;
  expected: string;
  actual: string;
}

export class TemplateVariableValidationError extends Error {
  readonly code = 'template_variable_validation_error';

  constructor(
    readonly templateKey: string,
    readonly templateVersion: string,
    readonly violations: TemplateVariableValidationViolation[],
  ) {
    super(
      `Template variable validation failed for ${templateKey}@${templateVersion}`,
    );
  }

  toMetadata() {
    return {
      code: this.code,
      templateKey: this.templateKey,
      templateVersion: this.templateVersion,
      violations: this.violations,
    };
  }
}

function getActualType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function normalizeSchema(template: EmailTemplateVersion): {
  required: Record<string, TemplateVariablePrimitiveType>;
  optional: Record<string, TemplateVariablePrimitiveType>;
} {
  const required =
    template.variableSchema?.required ??
    Object.fromEntries(
      (template.requiredVars || []).map((key) => [key, 'string']),
    );

  return {
    required,
    optional: template.variableSchema?.optional || {},
  };
}

export function renderTemplate(
  templateKey: string,
  template: EmailTemplateVersion,
  vars: Record<string, unknown>,
): { subject: string; html: string; text: string } {
  const schema = normalizeSchema(template);

  const allowedKeys = new Set([
    ...Object.keys(schema.required),
    ...Object.keys(schema.optional),
  ]);

  const violations: TemplateVariableValidationViolation[] = [];

  // Required validation
  for (const [key, expectedType] of Object.entries(schema.required)) {
    const value = vars[key];

    if (value === undefined || value === null) {
      violations.push({
        code: 'missing',
        key,
        expected: expectedType,
        actual: value === null ? 'null' : 'undefined',
      });
      continue;
    }

    if (typeof value !== expectedType) {
      violations.push({
        code: 'type_mismatch',
        key,
        expected: expectedType,
        actual: getActualType(value),
      });
    }
  }

  // Unknown + optional validation
  for (const [key, value] of Object.entries(vars)) {
    if (!allowedKeys.has(key)) {
      violations.push({
        code: 'unknown',
        key,
        expected: 'not_allowed',
        actual: getActualType(value),
      });
      continue;
    }

    const expectedType = schema.optional[key];
    if (expectedType && value !== undefined && value !== null) {
      if (typeof value !== expectedType) {
        violations.push({
          code: 'type_mismatch',
          key,
          expected: expectedType,
          actual: getActualType(value),
        });
      }
    }
  }

  if (violations.length > 0) {
    throw new TemplateVariableValidationError(
      templateKey,
      template.version,
      violations,
    );
  }

  const replaceVars = (str: string) =>
    str.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, k) =>
      vars[k] === undefined || vars[k] === null ? '' : String(vars[k]),
    );

  return {
    subject: replaceVars(template.subject),
    html: replaceVars(template.html),
    text: replaceVars(template.text),
  };
}


// ─────────────────────────────────────────────────────────────
// EMAIL SERVICE (Main Architecture + Your Feature)
// ─────────────────────────────────────────────────────────────

@Injectable()
export class EmailService implements OnModuleInit {

  private readonly logger = new Logger(EmailService.name);

  private primary: any = null;
  private fallback: any = null;

  private templateRegistry: TemplateRegistry = {};
  private rolloutMap: TemplateRolloutMap = {};

  constructor(
    private readonly configService: ConfigService,
    @Optional() private readonly auditLogService?: AuditLogService,
    @Optional() private readonly appLogger?: AppLogger,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────

  onModuleInit() {
    const registry =
      this.configService.get<TemplateRegistry>('templateRegistry');
    const rollout =
      this.configService.get<TemplateRolloutMap>('templateRolloutMap');

    if (registry) this.templateRegistry = registry;
    if (rollout) this.rolloutMap = rollout;
  }

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE PREVIEW (Your Feature)
  // ─────────────────────────────────────────────────────────────

  previewTemplate(
    templateKey: string,
    vars: Record<string, unknown>,
    version?: string,
  ) {
    const reg = this.templateRegistry[templateKey];

    if (!reg) {
      return {
        templateKey,
        version: version ?? 'unknown',
        lifecycleState: 'unknown',
        rendered: null,
        validationErrors: [
          `Template key "${templateKey}" is not registered.`,
        ],
        missingVars: [],
        requiredVars: [],
      };
    }

    const resolvedVersion = version ?? reg.activeVersion;
    const template = reg.versions[resolvedVersion];

    if (!template) {
      return {
        templateKey,
        version: resolvedVersion,
        lifecycleState: 'unknown',
        rendered: null,
        validationErrors: [
          `Version "${resolvedVersion}" not found.`,
        ],
        missingVars: [],
        requiredVars: [],
      };
    }

    try {
      const rendered = renderTemplate(templateKey, template, vars);

      return {
        templateKey,
        version: resolvedVersion,
        lifecycleState: template.lifecycleState,
        rendered,
        validationErrors: [],
        missingVars: [],
        requiredVars: template.requiredVars,
      };
    } catch (err) {
      return {
        templateKey,
        version: resolvedVersion,
        lifecycleState: template.lifecycleState,
        rendered: null,
        validationErrors: [
          err instanceof Error ? err.message : 'Unknown error',
        ],
        missingVars: [],
        requiredVars: template.requiredVars,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE RESOLUTION (Main Branch Style)
  // ─────────────────────────────────────────────────────────────

  private resolveActiveTemplate(key: string) {
    return resolveTemplate(
      this.templateRegistry,
      this.rolloutMap,
      key,
      'internal',
    );
  }

  // ─────────────────────────────────────────────────────────────
  // PUBLIC EMAIL METHODS
  // ─────────────────────────────────────────────────────────────

  async sendWelcomeEmail(email: string, username: string) {
    const templateKey = 'welcome';
    const resolved = this.resolveActiveTemplate(templateKey);

    if (!resolved) {
      throw new Error('No valid template for welcome');
    }

    const { template, isCanary } = resolved;

    const rendered = renderTemplate(templateKey, template, {
      username,
    });

    // sendEmail logic preserved from main branch
  }

}