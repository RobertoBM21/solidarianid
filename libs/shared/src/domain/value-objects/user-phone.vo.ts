import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidUserPhoneError implements DomainError {
  constructor(public readonly message: string) {}
}

export class UserPhone extends ValueObject<string> {
  // Basic validation: allow numbers, spaces, plus sign, dashes, parentheses
  static readonly PHONE_REGEX = /^(?:\+?\(?[0-9]{1,4}\)?)?[-\s./0-9]*$/;

  private constructor(value: string) {
    super(value);
  }

  get value(): string {
    return this.props;
  }

  static create(phone: string): Either<InvalidUserPhoneError, UserPhone> {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      return left(new InvalidUserPhoneError('User phone cannot be empty.'));
    }

    if (!this.PHONE_REGEX.test(trimmedPhone)) {
      return left(new InvalidUserPhoneError('Invalid user phone format.'));
    }

    return right(new UserPhone(trimmedPhone));
  }
}
