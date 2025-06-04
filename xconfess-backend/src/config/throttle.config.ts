import { registerAs } from '@nestjs/config';

export default registerAs('throttle', () => ({
  ttl: process.env.THROTTLE_TTL || 900, // 15 minutes in seconds
  limit: process.env.THROTTLE_LIMIT || 100, // requests per TTL
})); 