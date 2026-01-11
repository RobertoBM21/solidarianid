import { InvalidMoneyAmountError, MoneyAmount } from './money-amount.vo';

describe('MoneyAmount VO', () => {
  it('should create valid amount', () => {
    const result = MoneyAmount.create(10);

    expect(result.value).toBeInstanceOf(MoneyAmount);
    const amount = result.value as MoneyAmount;
    expect(amount.value).toBe(10);
  });

  it('should fail when amount is zero', () => {
    const result = MoneyAmount.create(0);

    expect(result.value).toBeInstanceOf(InvalidMoneyAmountError);
  });

  it('should fail when amount is negative', () => {
    const result = MoneyAmount.create(-1);

    expect(result.value).toBeInstanceOf(InvalidMoneyAmountError);
  });
});
