import {
  DomainError,
  Either,
  left,
  right,
  UniqueEntityID,
  ValueObject,
} from '@app/shared/domain';

export class InvalidAdminsListError implements DomainError {
  constructor(public readonly message: string) {}
}

export class AdminsList extends ValueObject<UniqueEntityID[]> {
  private constructor(admins: UniqueEntityID[]) {
    super(admins);
  }

  get value(): UniqueEntityID[] {
    return this.props;
  }

  has(userId: UniqueEntityID): boolean {
    return this.props.some((id) => id.equals(userId));
  }

  static create(
    adminIds: (string | UniqueEntityID)[],
  ): Either<InvalidAdminsListError, AdminsList> {
    if (!Array.isArray(adminIds)) {
      return left(
        new InvalidAdminsListError('Admins must be an array of UUIDs.'),
      );
    }

    const ids: UniqueEntityID[] = [];
    const seen = new Set<string>();

    for (const raw of adminIds) {
      const uid = typeof raw === 'string' ? UniqueEntityID.create(raw) : raw;

      if (seen.has(uid.value)) {
        return left(
          new InvalidAdminsListError(`Duplicate admin id: ${uid.value}`),
        );
      }

      seen.add(uid.value);
      ids.push(uid);
    }

    return right(new AdminsList(ids));
  }
}
