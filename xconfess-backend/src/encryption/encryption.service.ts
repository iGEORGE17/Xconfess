import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;
  private readonly ivLength = 16;
  private readonly authTagLength = 16;

  constructor(private configService: ConfigService) {
    const keyString = this.configService.get<string>('ENCRYPTION_KEY');

    if (!keyString) {
      throw new Error('ENCRYPTION_KEY must be set in environment variables');
    }

    // Ensure key is 32 bytes for AES-256
    this.key = Buffer.from(keyString, 'hex');

    if (this.key.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
    }
  }

  /**
   * Encrypts text using AES-256-GCM
   * @param text - Plain text to encrypt
   * @returns Encrypted string with IV and auth tag prepended
   */
  encrypt(text: string): string {
    if (!text) return text;

    try {
      const iv = randomBytes(this.ivLength);
      const cipher = createCipheriv(this.algorithm, this.key, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      // Format: iv:authTag:encryptedData
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypts text encrypted with encrypt()
   * @param encryptedText - Encrypted string with IV and auth tag
   * @returns Decrypted plain text
   */
  decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText;

    try {
      const parts = encryptedText.split(':');

      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const [ivHex, authTagHex, encrypted] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypts an object's specified fields
   * @param obj - Object to encrypt
   * @param fields - Array of field names to encrypt
   * @returns Object with encrypted fields
   */
  encryptFields<T extends Record<string, any>>(obj: T, fields: string[]): T {
    const encrypted = { ...obj };

    fields.forEach((field) => {
      if (field in encrypted && typeof encrypted[field] === 'string') {
        encrypted[field] = this.encrypt(encrypted[field]);
      }
    });

    return encrypted;
  }

  /**
   * Decrypts an object's specified fields
   * @param obj - Object with encrypted fields
   * @param fields - Array of field names to decrypt
   * @returns Object with decrypted fields
   */
  decryptFields<T extends Record<string, any>>(obj: T, fields: string[]): T {
    const decrypted = { ...obj };

    fields.forEach((field) => {
      if (field in decrypted && typeof decrypted[field] === 'string') {
        decrypted[field] = this.decrypt(decrypted[field]);
      }
    });

    return decrypted;
  }
}
