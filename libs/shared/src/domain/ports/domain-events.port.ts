import { AggregateRoot } from '../aggregate';
import { DomainError, Either } from '../errors';
import { DomainEvent } from '../event';

export class DomainEventError implements DomainError {
  constructor(public readonly message: string) {}
}

export abstract class DomainEventsPort {
  abstract dispatch(aggregate: AggregateRoot<unknown>): Promise<void>;

  abstract query<T>(event: DomainEvent): Promise<Either<DomainEventError, T>>;
}
