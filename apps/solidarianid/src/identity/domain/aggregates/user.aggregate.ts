import {
  Either,
  left,
  PasswordHasherPort,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import {
  AbstractUser,
  AbstractUserCreationError,
  AbstractUserProps,
} from '@app/shared/domain/aggregates/abstract-user.aggregate';
import { CountryCheckerPort } from '../ports/country-checker.port';
import { InvalidUserCityError, UserCity } from '../value-objects/user-city.vo';
import {
  InvalidUserCountryError,
  UserCountry,
} from '../value-objects/user-country.vo';

export interface UserProps extends AbstractUserProps {
  city: UserCity;
  country: UserCountry;
}

export type UserCreationError =
  | AbstractUserCreationError
  | InvalidUserCityError
  | InvalidUserCountryError;

export class User extends AbstractUser<UserProps> {
  get city(): string {
    return this.props.city.value;
  }

  get country(): string {
    return this.props.country.value;
  }

  static async create(
    data: {
      name: string;
      email: string;
      phone: string;
      password: string;
      city: string;
      country: string;
    },
    countryChecker: CountryCheckerPort,
    passwordHasher: PasswordHasherPort,
    id?: string,
  ): Promise<Either<UserCreationError, User>> {
    const propsOrError = await this.prepare(data, passwordHasher);
    if (propsOrError.isLeft()) {
      return left(propsOrError.value);
    }

    const cityOrError = UserCity.create(data.city);
    if (cityOrError.isLeft()) {
      return left(cityOrError.value);
    }

    const countryOrError = UserCountry.create(data.country, countryChecker);
    if (countryOrError.isLeft()) {
      return left(countryOrError.value);
    }

    const props = {
      ...propsOrError.value,
      city: cityOrError.value,
      country: countryOrError.value,
    };
    const idObj = id ? UniqueEntityID.create(id) : undefined;
    return right(new User(props, idObj));
  }

  static createWithHashed(
    data: {
      name: string;
      email: string;
      phone: string;
      city: string;
      country: string;
      hashedPassword: string;
    },
    countryChecker: CountryCheckerPort,
    id?: string,
  ): Either<UserCreationError, User> {
    const propsOrError = this.prepareWithHashed({
      ...data,
      hashedPassword: data.hashedPassword,
    });
    if (propsOrError.isLeft()) {
      return left(propsOrError.value);
    }

    const cityOrError = UserCity.create(data.city);
    if (cityOrError.isLeft()) {
      return left(cityOrError.value);
    }

    const countryOrError = UserCountry.create(data.country, countryChecker);
    if (countryOrError.isLeft()) {
      return left(countryOrError.value);
    }

    const props = {
      ...propsOrError.value,
      city: cityOrError.value,
      country: countryOrError.value,
    };
    const idObj = id ? UniqueEntityID.create(id) : undefined;
    return right(new User(props, idObj));
  }
}
