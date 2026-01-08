import {
  ActionCurrentAmount,
  ActionTargetAmount,
  InvalidActionCurrentAmountError,
  InvalidActionTargetAmountError,
} from './action-funding.vo';

describe('ActionFunding VOs', () => {
  it('Should create valid target amount', () => {
    const result = ActionTargetAmount.create(100);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.value).toBe(100);
    }
  });

  it('Should fail when target amount is missing', () => {
    const result = ActionTargetAmount.create(undefined);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidActionTargetAmountError);
    }
  });

  it('Should fail when target amount is negative', () => {
    const result = ActionTargetAmount.create(-1);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidActionTargetAmountError);
    }
  });

  it('Should create valid current amount', () => {
    const result = ActionCurrentAmount.create(0);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.value).toBe(0);
    }
  });

  it('Should fail when current amount is negative', () => {
    const result = ActionCurrentAmount.create(-1);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidActionCurrentAmountError);
    }
  });
});
