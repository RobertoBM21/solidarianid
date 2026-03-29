import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidDescriptionError implements DomainError {
  constructor(public readonly message: string) {}
}

export class Description extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  get value(): string {
    return this.props;
  }

  static create(
    description: string,
  ): Either<InvalidDescriptionError, Description> {
    const cleanValue = description.trim();

    if (cleanValue.length === 0) {
      return left(
        new InvalidDescriptionError('Cause description cannot be empty.'),
      );
    }

    return right(new Description(cleanValue));
  }
}
