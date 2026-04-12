import {
  AggregateRoot,
  DomainError,
  Either,
  left,
  PasswordHasherPort,
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

export interface AbstractUserProps {
  name: UserName;
  email: UserEmail;
  phone?: UserPhone;
  passwordHash?: UserPassword;
}

export type AbstractUserCreationError =
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

export interface AbstractUserCreationData {
  name: string;
  email: string;
  phone: string;
}

export abstract class AbstractUser<
  P extends AbstractUserProps,
> extends AggregateRoot<P> {
  protected constructor(props: P, id?: UniqueEntityID) {
    super(props, id);
  }

  get name(): string {
    return this.props.name.value;
  }

  get email(): string {
    return this.props.email.value;
  }

  get phone(): string | undefined {
    return this.props.phone?.value;
  }

  get passwordHash(): string | undefined {
    return this.props.passwordHash?.value;
  }

  protected static async prepare(
    data: AbstractUserCreationData & { password: string },
    passwordHasher: PasswordHasherPort,
  ): Promise<Either<AbstractUserCreationError, AbstractUserProps>> {
    const passwordOrError = await UserPassword.create(
      data.password,
      passwordHasher,
    );

    if (passwordOrError.isLeft()) {
      return left(passwordOrError.value);
    }

    return this.prepareWithHashed({
      ...data,
      hashedPassword: passwordOrError.value.value,
    });
  }

  protected static prepareWithHashed(
    data: AbstractUserCreationData & {
      hashedPassword: string;
    },
  ): Either<AbstractUserCreationError, AbstractUserProps> {
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

    const passwordHash = UserPassword.fromHashed(data.hashedPassword);

    const props = {
      name: nameOrError.value,
      email: emailOrError.value,
      phone: phoneOrError.value,
      passwordHash,
    };
    return right(props);
  }

  protected static prepareSocialUser(data: {
    name: string;
    email: string;
  }): Either<AbstractUserCreationError, AbstractUserProps> {
    const nameOrError = UserName.create(data.name);
    if (nameOrError.isLeft()) {
      return left(nameOrError.value);
    }

    const emailOrError = UserEmail.create(data.email);
    if (emailOrError.isLeft()) {
      return left(emailOrError.value);
    }

    return right({
      name: nameOrError.value,
      email: emailOrError.value,
    });
  }
}
