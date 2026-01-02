import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidDateError implements DomainError {
  constructor(public readonly message: string) {}
}

export class CreationDate extends ValueObject<Date> {
  private constructor(date: Date) {
    super(date);
  }

  get value(): Date {
    return this.props;
  }

  static create(date?: Date | string): Either<InvalidDateError, CreationDate> {
    const dateObj =
      date instanceof Date ? date : date ? new Date(date) : new Date();

    if (isNaN(dateObj.getTime())) {
      return left(
        new InvalidDateError('Invalid date provided for creation date.'),
      );
    }

    const now = new Date();
    if (dateObj > now) {
      return left(
        new InvalidDateError('Creation date cannot be in the future.'),
      );
    }

    return right(new CreationDate(dateObj));
  }
}
