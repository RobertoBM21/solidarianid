import {
  DomainError,
  Either,
  left,
  right,
  UniqueEntityID,
  ValueObject,
} from '@app/shared/domain';
import { Cause } from '../entities/cause.entity';

export class InvalidCausesListError implements DomainError {
  constructor(public readonly message: string) {}
}

export class CausesList extends ValueObject<Cause[]> {
  private map: Map<string, Cause>;

  private constructor(causes: Cause[]) {
    super(causes);
    this.map = new Map(causes.map((cause) => [cause.id.toString(), cause]));
  }

  get value(): Cause[] {
    return this.props;
  }

  getCause(causeId: UniqueEntityID): Cause | undefined {
    return this.map.get(causeId.toString());
  }

  withAdded(cause: Cause): Either<InvalidCausesListError, CausesList> {
    if (this.props.some((c) => c.id.equals(cause.id))) {
      return left(
        new InvalidCausesListError(
          `Cause with id ${cause.id.toString()} already exists in the list.`,
        ),
      );
    }
    return right(new CausesList([...this.props, cause]));
  }

  withUpdated(cause: Cause): Either<InvalidCausesListError, CausesList> {
    const index = this.props.findIndex((c) => c.id.equals(cause.id));
    if (index === -1) {
      return left(
        new InvalidCausesListError(
          `Cause with id ${cause.id.toString()} does not exist in the list.`,
        ),
      );
    }
    const updatedCauses = [...this.props];
    updatedCauses[index] = cause;
    return right(new CausesList(updatedCauses));
  }

  static create(causes: Cause[]): Either<InvalidCausesListError, CausesList> {
    const ids: UniqueEntityID[] = [];
    const seen = new Set<string>();

    for (const { id } of causes) {
      if (seen.has(id.value)) {
        return left(
          new InvalidCausesListError(`Duplicate cause id: ${id.value}`),
        );
      }

      seen.add(id.value);
      ids.push(id);
    }

    return right(new CausesList(causes));
  }
}
