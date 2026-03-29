import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidActionObjectivesError implements DomainError {
  message = 'Action objectives must be a list of non-empty strings.';
}

export class ActionObjectives extends ValueObject<string[]> {
  private constructor(value: string[]) {
    super(value);
  }

  get value(): readonly string[] {
    return this.props;
  }

  static create(
    objectives: string[],
  ): Either<InvalidActionObjectivesError, ActionObjectives> {
    const cleaned = objectives.map((item) => item.trim());
    if (cleaned.some((item) => item.length === 0)) {
      return left(new InvalidActionObjectivesError());
    }

    return right(new ActionObjectives(cleaned));
  }
}
