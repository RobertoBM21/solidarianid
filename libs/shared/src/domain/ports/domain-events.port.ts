import { AggregateRoot } from '../aggregate';

export abstract class DomainEventsPort {
  abstract dispatch(aggregate: AggregateRoot<unknown>): Promise<void>;
}
