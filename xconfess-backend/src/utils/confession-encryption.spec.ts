import { encryptConfession, decryptConfession } from './confession-encryption';

describe('Confession AES Encryption', () => {
  const key = '12345678901234567890123456789012'; // 32 chars
  const originalEnv = process.env.CONFESSION_AES_KEY;

  beforeAll(() => {
    process.env.CONFESSION_AES_KEY = key;
  });

  afterAll(() => {
    process.env.CONFESSION_AES_KEY = originalEnv;
  });

  it('should encrypt and decrypt confession text correctly', () => {
    const text = 'This is a secret confession.';
    const encrypted = encryptConfession(text);
    const decrypted = decryptConfession(encrypted);
    expect(decrypted).toBe(text);
  });

  it('should produce different ciphertexts for same text (random IV)', () => {
    const text = 'Same confession';
    const encrypted1 = encryptConfession(text);
    const encrypted2 = encryptConfession(text);
    expect(encrypted1).not.toBe(encrypted2);
    expect(decryptConfession(encrypted1)).toBe(text);
    expect(decryptConfession(encrypted2)).toBe(text);
  });

  it('should throw error for invalid key length', () => {
    process.env.CONFESSION_AES_KEY = 'shortkey';
    expect(() => encryptConfession('test')).toThrow();
    expect(() => decryptConfession('invalid')).toThrow();
    process.env.CONFESSION_AES_KEY = key;
  });
});
