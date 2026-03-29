import { CauseOds, InvalidCauseOdsError } from './cause-ods.vo';

describe('CauseOds VO', () => {
  it('should create a valid ODS', () => {
    const result = CauseOds.create(5);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.value).toBe(5);
    }
  });

  it('should fail for non-integer ODS', () => {
    const result = CauseOds.create(3.5);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidCauseOdsError);
    }
  });

  it('should fail for out-of-range ODS', () => {
    const result = CauseOds.create(20);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidCauseOdsError);
    }
  });
});
