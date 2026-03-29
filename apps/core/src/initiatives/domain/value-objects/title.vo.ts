import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidTitleError implements DomainError {
  message = 'Cause title must be between 1 and 255 characters.';
}

export class Title extends ValueObject<string> {
  private static readonly MAX_LENGTH = 255;

  private constructor(value: string) {
    super(value);
  }

  get value(): string {
    return this.props;
  }

  static create(title: string): Either<InvalidTitleError, Title> {
    const cleanValue = title.trim();

    if (cleanValue.length === 0 || cleanValue.length > this.MAX_LENGTH) {
      return left(new InvalidTitleError());
    }

    return right(new Title(cleanValue));
  }
}
