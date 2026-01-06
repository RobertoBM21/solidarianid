import {
  CauseDescription,
  InvalidCauseDescriptionError,
} from './cause-description.vo';

describe('CauseDescription VO', () => {
  it('should create a valid description', () => {
    const result = CauseDescription.create('Una causa solidaria');

    expect(result.isRight()).toBe(true);
  });

  it('should fail on empty description', () => {
    const result = CauseDescription.create('  ');

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidCauseDescriptionError);
    }
  });
});
