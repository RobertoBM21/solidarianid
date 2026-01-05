import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidCauseDescriptionError implements DomainError {
  constructor(public readonly message: string) {}
}

export class CauseDescription extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  get value(): string {
    return this.props;
  }

  static create(
    description: string,
  ): Either<InvalidCauseDescriptionError, CauseDescription> {
    const cleanValue = description.trim();

    if (cleanValue.length === 0) {
      return left(
        new InvalidCauseDescriptionError('Cause description cannot be empty.'),
      );
    }

    return right(new CauseDescription(cleanValue));
  }
}
