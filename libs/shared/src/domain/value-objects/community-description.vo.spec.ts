import {
  CommunityDescription,
  InvalidCommunityDescriptionError,
} from './community-description.vo';

describe('CommunityDescription Value Object', () => {
  it('should create a CommunityDescription with valid length', () => {
    const result = CommunityDescription.create(
      'This is a valid community description.',
    );
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const communityDescription = result.value;
      expect(communityDescription.value).toBe(
        'This is a valid community description.',
      );
    }
  });

  it('should return an error for a description that is too long', () => {
    const longDescription = 'A'.repeat(257);
    const result = CommunityDescription.create(longDescription);
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      const error = result.value;
      expect(error).toBeInstanceOf(InvalidCommunityDescriptionError);
      expect(error.message).toBe(
        'Community description must not exceed 256 characters.',
      );
    }
  });
});
