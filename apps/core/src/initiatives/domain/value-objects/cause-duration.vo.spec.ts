import { CauseDuration, InvalidCauseDurationError } from './cause-duration.vo';

describe('CauseDuration VO', () => {
  it('should create a valid duration', () => {
    const result = CauseDuration.create('3 meses');

    expect(result.isRight()).toBe(true);
  });

  it('should fail on empty duration', () => {
    const result = CauseDuration.create('  ');

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidCauseDurationError);
    }
  });

  it('should fail when the duration is too long', () => {
    const longDuration = 'x'.repeat(101);

    const result = CauseDuration.create(longDuration);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidCauseDurationError);
    }
  });
});
