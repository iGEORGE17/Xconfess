import { maskUserId } from './mask-user-id';

describe('maskUserId', () => {
  it('should return a SHA256 hash for a string user ID', () => {
    const masked = maskUserId('user123');
    expect(masked).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should return a SHA256 hash for a numeric user ID', () => {
    const masked = maskUserId(456);
    expect(masked).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should produce different hashes for different user IDs', () => {
    expect(maskUserId('userA')).not.toEqual(maskUserId('userB'));
  });

  it('should not expose the raw user ID in the hash', () => {
    const userId = 'secretUser';
    const masked = maskUserId(userId);
    expect(masked).not.toContain(userId);
  });
});
