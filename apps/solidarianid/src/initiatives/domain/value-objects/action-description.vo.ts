import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidActionDescriptionError implements DomainError {
  message = 'Action description must be between 1 and 1000 characters.';
}

export class ActionDescription extends ValueObject<string> {
  private static readonly MAX_LENGTH = 1000;

  private constructor(value: string) {
    super(value);
  }

  get value(): string {
    return this.props;
  }

  static create(
    description: string,
  ): Either<InvalidActionDescriptionError, ActionDescription> {
    const cleanValue = description.trim();

    if (cleanValue.length === 0 || cleanValue.length > this.MAX_LENGTH) {
      return left(new InvalidActionDescriptionError());
    }

    return right(new ActionDescription(cleanValue));
  }
}
