import { AggregateRoot } from '../aggregate';
import { DomainError } from '../errors';

export class DomainEventError implements DomainError {
  constructor(public readonly message: string) {}
}

export abstract class DomainEventsPort {
  abstract dispatch(aggregate: AggregateRoot<unknown>): Promise<void>;
}
