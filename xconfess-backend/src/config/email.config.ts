import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
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
}));

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
