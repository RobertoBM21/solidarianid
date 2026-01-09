import {
  AggregateRoot,
  DomainError,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import {
  InvalidUserEmailError,
  UserEmail,
} from '@app/shared/domain/value-objects/user-email.vo';
import {
  InvalidUserNameError,
  UserName,
} from '@app/shared/domain/value-objects/user-name.vo';
import {
  InvalidUserPasswordError,
  UserPassword,
} from '@app/shared/domain/value-objects/user-password.vo';
import {
  InvalidUserPhoneError,
  UserPhone,
} from '@app/shared/domain/value-objects/user-phone.vo';
import { CountryCheckerPort } from '../ports/country-checker.port';
import { InvalidUserCityError, UserCity } from '../value-objects/user-city.vo';
import {
  InvalidUserCountryError,
  UserCountry,
} from '../value-objects/user-country.vo';

export interface UserProps {
  name: UserName;
  email: UserEmail;
  phone: UserPhone;
  passwordHash: UserPassword;
  city: UserCity;
  country: UserCountry;
}

export class UserAlreadyExistsError implements DomainError {
  message = 'User with the given email already exists.';
}

export type UserCreationError =
  | InvalidUserNameError
  | InvalidUserEmailError
  | InvalidUserPhoneError
  | InvalidUserPasswordError
  | InvalidUserCityError
  | InvalidUserCountryError;

export class User extends AggregateRoot<UserProps> {
  get name(): string {
    return this.props.name.value;
  }

  get email(): string {
    return this.props.email.value;
  }

  get phone(): string {
    return this.props.phone.value;
  }

  get passwordHash(): string {
    return this.props.passwordHash.value;
  }

  get city(): string {
    return this.props.city.value;
  }

  get country(): string {
    return this.props.country.value;
  }

  static create(
    data: {
      name: string;
      email: string;
      phone: string;
      passwordHash: string;
      city: string;
      country: string;
    },
    countryChecker: CountryCheckerPort,
    id?: string,
  ): Either<UserCreationError, User> {
    const nameOrError = UserName.create(data.name);
    if (nameOrError.isLeft()) {
      return left(nameOrError.value);
    }

    const emailOrError = UserEmail.create(data.email);
    if (emailOrError.isLeft()) {
      return left(emailOrError.value);
    }

    const phoneOrError = UserPhone.create(data.phone);
    if (phoneOrError.isLeft()) {
      return left(phoneOrError.value);
    }

    const passwordOrError = UserPassword.create(data.passwordHash);
    if (passwordOrError.isLeft()) {
      return left(passwordOrError.value);
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
      name: nameOrError.value,
      email: emailOrError.value,
      phone: phoneOrError.value,
      passwordHash: passwordOrError.value,
      city: cityOrError.value,
      country: countryOrError.value,
    };
    const idObj = id ? UniqueEntityID.create(id) : undefined;
    return right(new User(props, idObj));
  }
}
