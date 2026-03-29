import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidCauseDurationError implements DomainError {
  constructor(public readonly message: string) {}
}

export class CauseDuration extends ValueObject<string> {
  private static readonly MAX_LENGTH = 100;

  private constructor(value: string) {
    super(value);
  }

  get value(): string {
    return this.props;
  }

  static create(
    duration: string,
  ): Either<InvalidCauseDurationError, CauseDuration> {
    const value = duration.trim();
    if (value.length === 0 || value.length > this.MAX_LENGTH) {
      return left(
        new InvalidCauseDurationError(
          'Cause duration must have between 1 and 100 characters.',
        ),
      );
    }

    return right(new CauseDuration(value));
  }
}
