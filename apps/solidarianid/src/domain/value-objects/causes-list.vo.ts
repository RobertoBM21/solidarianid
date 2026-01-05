import {
  DomainError,
  Either,
  left,
  right,
  UniqueEntityID,
  ValueObject,
} from '@app/shared/domain';

export class InvalidCausesListError implements DomainError {
  constructor(public readonly message: string) {}
}

export class CausesList extends ValueObject<UniqueEntityID[]> {
  private constructor(causes: UniqueEntityID[]) {
    super(causes);
  }

  get value(): UniqueEntityID[] {
    return this.props;
  }

  static create(
    causeIds: (string | UniqueEntityID)[],
  ): Either<InvalidCausesListError, CausesList> {
    if (!Array.isArray(causeIds)) {
      return left(
        new InvalidCausesListError('Causes must be an array of UUIDs.'),
      );
    }

    const ids: UniqueEntityID[] = [];
    const seen = new Set<string>();

    for (const raw of causeIds) {
      const uid = typeof raw === 'string' ? UniqueEntityID.create(raw) : raw;

      if (seen.has(uid.value)) {
        return left(
          new InvalidCausesListError(`Duplicate cause id: ${uid.value}`),
        );
      }

      seen.add(uid.value);
      ids.push(uid);
    }

    return right(new CausesList(ids));
  }

  withAdded(id: UniqueEntityID): Either<InvalidCausesListError, CausesList> {
    if (this.props.find((existing) => existing.equals(id))) {
      return left(
        new InvalidCausesListError(`Duplicate cause id: ${id.value}`),
      );
    }
    return right(new CausesList([...this.props, id]));
  }
}
