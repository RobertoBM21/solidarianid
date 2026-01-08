import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidActionTitleError implements DomainError {
  message = 'Action title must be between 1 and 255 characters.';
}

export class ActionTitle extends ValueObject<string> {
  private static readonly MAX_LENGTH = 255;

  private constructor(value: string) {
    super(value);
  }

  get value(): string {
    return this.props;
  }

  static create(title: string): Either<InvalidActionTitleError, ActionTitle> {
    const cleanValue = title.trim();

    if (cleanValue.length === 0 || cleanValue.length > this.MAX_LENGTH) {
      return left(new InvalidActionTitleError());
    }

    return right(new ActionTitle(cleanValue));
  }
}
