import { CryptoUtil } from './crypto.util';

describe('CryptoUtil', () => {
  const testEmail = 'test@example.com';

  it('should encrypt and decrypt text correctly', () => {
    const { encrypted, iv, tag } = CryptoUtil.encrypt(testEmail);
    expect(encrypted).toBeDefined();
    expect(iv).toBeDefined();
    expect(tag).toBeDefined();
    const decrypted = CryptoUtil.decrypt(encrypted, iv, tag);
    expect(decrypted).toBe(testEmail);
  });

  it('should produce a consistent hash for the same input', () => {
    const hash1 = CryptoUtil.hash(testEmail);
    const hash2 = CryptoUtil.hash(testEmail);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('should produce different hashes for different inputs', () => {
    const hash1 = CryptoUtil.hash('a@example.com');
    const hash2 = CryptoUtil.hash('b@example.com');
    expect(hash1).not.toBe(hash2);
  });
});
