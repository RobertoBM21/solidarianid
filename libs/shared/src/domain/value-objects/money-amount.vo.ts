import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidMoneyAmountError implements DomainError {
  message = 'Money amount must be greater than zero.';
}

/**
 * Value Object representing a positive monetary amount.
 */
export class MoneyAmount extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  get value(): number {
    return this.props;
  }

  static create(
    currentAmount: number | undefined,
  ): Either<InvalidMoneyAmountError, MoneyAmount> {
    if (currentAmount === undefined || currentAmount <= 0) {
      return left(new InvalidMoneyAmountError());
    }
    return right(new MoneyAmount(currentAmount));
  }
}
