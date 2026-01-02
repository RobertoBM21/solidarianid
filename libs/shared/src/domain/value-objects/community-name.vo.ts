import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidCommunityNameError implements DomainError {
  constructor(public readonly message: string) {}
}

export class CommunityName extends ValueObject<string> {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 64;

  private constructor(name: string) {
    super(name);
  }

  get value(): string {
    return this.props;
  }

  static create(
    name: string,
  ): Either<InvalidCommunityNameError, CommunityName> {
    const length = name.trim().length;

    if (length < this.MIN_LENGTH || length > this.MAX_LENGTH) {
      return left(
        new InvalidCommunityNameError(
          `Community name must be between ${this.MIN_LENGTH.toFixed()} and ${this.MAX_LENGTH.toFixed()} characters long.`,
        ),
      );
    }

    return right(new CommunityName(name));
  }
}
