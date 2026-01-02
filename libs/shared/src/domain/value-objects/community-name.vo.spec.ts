import { CommunityName, InvalidCommunityNameError } from './community-name.vo';

describe('CommunityName Value Object', () => {
  it('should create a CommunityName with valid length', () => {
    const result = CommunityName.create('Valid Community');
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const communityName = result.value;
      expect(communityName.value).toBe('Valid Community');
    }
  });

  it('should return an error for a name that is too short', () => {
    const result = CommunityName.create('AB');
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      const error = result.value;
      expect(error).toBeInstanceOf(InvalidCommunityNameError);
      expect(error.message).toBe(
        'Community name must be between 3 and 64 characters long.',
      );
    }
  });

  it('should return an error for a name that is too long', () => {
    const longName = 'A'.repeat(65);
    const result = CommunityName.create(longName);
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      const error = result.value;
      expect(error).toBeInstanceOf(InvalidCommunityNameError);
      expect(error.message).toBe(
        'Community name must be between 3 and 64 characters long.',
      );
    }
  });
});
