import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidUserNameError implements DomainError {
  constructor(public readonly message: string) {}
}

export class UserName extends ValueObject<string> {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 100;

  private constructor(value: string) {
    super(value);
  }

  get value(): string {
    return this.props;
  }

  static create(name: string): Either<InvalidUserNameError, UserName> {
    const value = name.trim();

    if (value.length < this.MIN_LENGTH || value.length > this.MAX_LENGTH) {
      return left(
        new InvalidUserNameError(
          `User name must be between ${this.MIN_LENGTH.toFixed()} and ${this.MAX_LENGTH.toFixed()} characters long.`,
        ),
      );
    }

    return right(new UserName(value));
  }
}
