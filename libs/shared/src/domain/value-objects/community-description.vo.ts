import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidCommunityDescriptionError implements DomainError {
  constructor(public readonly message: string) {}
}

export class CommunityDescription extends ValueObject<string> {
  private static readonly MAX_LENGTH = 256;

  private constructor(description: string) {
    super(description);
  }

  get value(): string {
    return this.props;
  }

  static create(
    description: string,
  ): Either<InvalidCommunityDescriptionError, CommunityDescription> {
    const desc = description.trim();
    if (desc.length > this.MAX_LENGTH) {
      return left(
        new InvalidCommunityDescriptionError(
          `Community description must not exceed ${this.MAX_LENGTH.toFixed()} characters.`,
        ),
      );
    }

    return right(new CommunityDescription(desc));
  }
}
