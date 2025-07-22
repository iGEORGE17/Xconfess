import { CryptoUtil } from '../src/common/crypto.util';

describe('User Email Migration', () => {
  it('should migrate plain email to encrypted and hashed fields', () => {
    // Simulate a user record before migration
    const oldUser = {
      id: 1,
      email: 'legacy@example.com',
      // ...other fields
    };

    // Migration logic: encrypt and hash the email
    const { encrypted, iv, tag } = CryptoUtil.encrypt(oldUser.email);
    const emailHash = CryptoUtil.hash(oldUser.email);

    // Simulate migrated user record
    const migratedUser = {
      id: oldUser.id,
      emailEncrypted: encrypted,
      emailIv: iv,
      emailTag: tag,
      emailHash,
      // ...other fields
    };

    // Validate migration
    expect(migratedUser.emailEncrypted).toBeDefined();
    expect(migratedUser.emailIv).toBeDefined();
    expect(migratedUser.emailTag).toBeDefined();
    expect(migratedUser.emailHash).toBe(emailHash);
    // Decrypt and check
    const decrypted = CryptoUtil.decrypt(migratedUser.emailEncrypted, migratedUser.emailIv, migratedUser.emailTag);
    expect(decrypted).toBe(oldUser.email);
  });
});
