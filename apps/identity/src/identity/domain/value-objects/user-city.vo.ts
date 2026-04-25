import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidUserCityError implements DomainError {
  constructor(public readonly message: string) {}
}

export class UserCity extends ValueObject<string> {
  private static readonly MAX_LENGTH = 128;

  private constructor(value: string) {
    super(value);
  }

  get value(): string {
    return this.props;
  }

  static create(city: string): Either<InvalidUserCityError, UserCity> {
    const trimmedCity = city.trim();
    const length = trimmedCity.length;

    if (length === 0) {
      return left(new InvalidUserCityError('User city cannot be empty.'));
    }

    if (length > this.MAX_LENGTH) {
      return left(
        new InvalidUserCityError(
          `User city must not exceed ${this.MAX_LENGTH.toFixed()} characters.`,
        ),
      );
    }

    return right(new UserCity(trimmedCity));
  }
}
