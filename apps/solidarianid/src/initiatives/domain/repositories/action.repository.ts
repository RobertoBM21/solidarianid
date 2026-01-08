import { DomainError, Repository, UniqueEntityID } from '@app/shared/domain';
import { Action } from '../aggregates/action.aggregate';

export class ActionNotFoundError implements DomainError {
  readonly message: string;
  constructor(public readonly actionId: string) {
    this.message = `Action with ID ${actionId} not found.`;
  }
}

export abstract class ActionRepository extends Repository<
  Action,
  ActionNotFoundError
> {
  abstract listByCause(causeId: UniqueEntityID): Promise<Action[]>;
}
