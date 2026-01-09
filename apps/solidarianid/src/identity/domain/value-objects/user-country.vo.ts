import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';
import { CountryCheckerPort } from '../ports/country-checker.port';

export class InvalidUserCountryError implements DomainError {
  message = 'User country must be a valid 2-letter alpha code.';
}

export class UserCountry extends ValueObject<string> {
  private static readonly ALPHA_2_CODE_LENGTH = 2;

  private constructor(value: string) {
    super(value);
  }

  get value(): string {
    return this.props;
  }

  static create(
    country: string,
    checker: CountryCheckerPort,
  ): Either<InvalidUserCountryError, UserCountry> {
    const trimmedCountry = country.trim().toLowerCase();

    if (
      trimmedCountry.length !== this.ALPHA_2_CODE_LENGTH ||
      !checker.isValidCountryCode(trimmedCountry)
    ) {
      return left(new InvalidUserCountryError());
    }

    return right(new UserCountry(trimmedCountry));
  }
}
