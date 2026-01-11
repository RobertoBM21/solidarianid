import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidVolunteeringDateError implements DomainError {
  constructor(public readonly message: string) {}
}

export class VolunteeringDate extends ValueObject<Date> {
  private constructor(date: Date) {
    super(date);
  }

  get value(): Date {
    return this.props;
  }

  static create(
    date: Date | string,
  ): Either<InvalidVolunteeringDateError, VolunteeringDate> {
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      return left(
        new InvalidVolunteeringDateError(
          'Invalid date provided for volunteering date.',
        ),
      );
    }

    return right(new VolunteeringDate(dateObj));
  }
}
