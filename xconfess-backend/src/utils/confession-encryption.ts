import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const ivLength = 16;

export function encryptConfession(text: string): string {
  const key = process.env.CONFESSION_AES_KEY;
  if (!key || key.length !== 32) throw new Error('Invalid AES key');
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decryptConfession(encrypted: string): string {
  const key = process.env.CONFESSION_AES_KEY;
  if (!key || key.length !== 32) throw new Error('Invalid AES key');
  const [ivHex, encryptedText] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
