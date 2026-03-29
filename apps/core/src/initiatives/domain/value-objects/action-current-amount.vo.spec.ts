import {
  ActionCurrentAmount,
  InvalidActionCurrentAmountError,
} from './action-current-amount.vo';

describe('ActionCurrentAmount VO', () => {
  it('should create valid current amount', () => {
    const result = ActionCurrentAmount.create(100);

    expect(result.value).toBeInstanceOf(ActionCurrentAmount);
    const actionCurrentAmount = result.value as ActionCurrentAmount;
    expect(actionCurrentAmount.value).toBe(100);
  });

  it('should fail when current amount is missing', () => {
    const result = ActionCurrentAmount.create(undefined);

    expect(result.value).toBeInstanceOf(InvalidActionCurrentAmountError);
  });

  it('should fail when current amount is negative', () => {
    const result = ActionCurrentAmount.create(-1);

    expect(result.value).toBeInstanceOf(InvalidActionCurrentAmountError);
  });
});
