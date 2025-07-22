import * as crypto from 'crypto';

/**
 * Masks a user ID using SHA256 hashing.
 * @param userId - The raw user ID (string or number)
 * @returns Masked user ID as a hex string
 */
export function maskUserId(userId: string | number): string {
  return crypto.createHash('sha256').update(String(userId)).digest('hex');
}
