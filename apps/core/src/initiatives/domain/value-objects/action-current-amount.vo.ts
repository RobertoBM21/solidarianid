import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidActionCurrentAmountError implements DomainError {
  message = 'Action current amount must be zero or greater.';
}

export class ActionCurrentAmount extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  get value(): number {
    return this.props;
  }

  plus(
    amount: number,
  ): Either<InvalidActionCurrentAmountError, ActionCurrentAmount> {
    if (amount <= 0) {
      return left(new InvalidActionCurrentAmountError());
    }
    return right(new ActionCurrentAmount(this.value + amount));
  }

  static create(
    targetAmount: number | undefined,
  ): Either<InvalidActionCurrentAmountError, ActionCurrentAmount> {
    if (targetAmount === undefined || targetAmount < 0) {
      return left(new InvalidActionCurrentAmountError());
    }
    return right(new ActionCurrentAmount(targetAmount));
  }
}
