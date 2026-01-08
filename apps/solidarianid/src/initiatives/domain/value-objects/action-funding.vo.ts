import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidActionTargetAmountError implements DomainError {
  message = 'Action target amount must be a positive number.';
}

export class InvalidActionCurrentAmountError implements DomainError {
  message = 'Action current amount must be zero or greater.';
}

export class ActionTargetAmount extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  get value(): number {
    return this.props;
  }

  static create(
    targetAmount: number | undefined,
  ): Either<InvalidActionTargetAmountError, ActionTargetAmount> {
    if (typeof targetAmount !== 'number' || targetAmount <= 0) {
      return left(new InvalidActionTargetAmountError());
    }
    return right(new ActionTargetAmount(targetAmount));
  }
}

export class ActionCurrentAmount extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  get value(): number {
    return this.props;
  }

  static create(
    currentAmount: number | undefined,
  ): Either<InvalidActionCurrentAmountError, ActionCurrentAmount> {
    if (typeof currentAmount !== 'number' || currentAmount < 0) {
      return left(new InvalidActionCurrentAmountError());
    }
    return right(new ActionCurrentAmount(currentAmount));
  }
}
