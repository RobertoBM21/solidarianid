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

export interface AdminUserProps {
  name: UserName;
  email: UserEmail;
  phone: UserPhone;
  passwordHash: UserPassword;
}

export type AdminUserCreationError =
  | InvalidUserNameError
  | InvalidUserEmailError
  | InvalidUserPhoneError
  | InvalidUserPasswordError;

export class InvalidCredentialsError implements DomainError {
  message = 'Invalid credentials';
}

export class UserAlreadyExistsError implements DomainError {
  message = 'User already exists';
}

export class AdminUser extends AggregateRoot<AdminUserProps> {
  private constructor(props: AdminUserProps, id?: UniqueEntityID) {
    super(props, id);
  }

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

  static create(
    data: {
      name: string;
      email: string;
      phone: string;
      passwordHash: string;
    },
    id?: UniqueEntityID,
  ): Either<AdminUserCreationError, AdminUser> {
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

    const props = {
      name: nameOrError.value,
      email: emailOrError.value,
      phone: phoneOrError.value,
      passwordHash: passwordOrError.value,
    };
    return right(new AdminUser(props, id));
  }
}
