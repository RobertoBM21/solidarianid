import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidUserEmailError implements DomainError {
  constructor(public readonly message: string) {}
}

export class UserEmail extends ValueObject<string> {
  // Paula (5 ene 2026): emails should not be validated with regexes, but whatever...
  static readonly EMAIL_REGEX =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  private constructor(value: string) {
    super(value);
  }

  get value(): string {
    return this.props;
  }

  static create(email: string): Either<InvalidUserEmailError, UserEmail> {
    const trimmedEmail = email.trim().toLocaleLowerCase();
    if (!trimmedEmail) {
      return left(new InvalidUserEmailError('User email cannot be empty.'));
    }

    if (!this.EMAIL_REGEX.test(trimmedEmail)) {
      return left(new InvalidUserEmailError('Invalid user email format.'));
    }

    return right(new UserEmail(trimmedEmail));
  }
}
