import { InvalidTitleError, Title } from './title.vo';

describe('Title VO', () => {
  it('should create a valid title', () => {
    const result = Title.create('Recogida');

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.value).toBe('Recogida');
    }
  });

  it('should fail on empty title', () => {
    const result = Title.create('   ');

    expect(result.isLeft()).toBe(true);

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidTitleError);
    }
  });

  it('should fail on too long title', () => {
    const longTitle = 'A'.repeat(256);

    const result = Title.create(longTitle);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidTitleError);
    }
  });
});
