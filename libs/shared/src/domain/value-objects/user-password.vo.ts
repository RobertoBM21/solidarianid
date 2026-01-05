import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidUserPasswordError implements DomainError {
  message = 'Invalid user password';
}

export class UserPassword extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  get value(): string {
    return this.props;
  }

  static create(
    passwordHash: string,
  ): Either<InvalidUserPasswordError, UserPassword> {
    if (!passwordHash) {
      return left(new InvalidUserPasswordError());
    }

    return right(new UserPassword(passwordHash));
  }
}
