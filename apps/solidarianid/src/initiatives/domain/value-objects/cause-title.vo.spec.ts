import { CauseTitle, InvalidCauseTitleError } from './cause-title.vo';

describe('CauseTitle VO', () => {
  it('should create a valid title', () => {
    const result = CauseTitle.create('Recogida');

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.value).toBe('Recogida');
    }
  });

  it('should fail on empty title', () => {
    const result = CauseTitle.create('   ');

    expect(result.isLeft()).toBe(true);

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidCauseTitleError);
    }
  });

  it('should fail on too long title', () => {
    const longTitle = 'A'.repeat(256);

    const result = CauseTitle.create(longTitle);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidCauseTitleError);
    }
  });
});
