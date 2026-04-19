import { DomainEvent } from '@app/shared/domain';

export class CauseClosedEvent implements DomainEvent {
  readonly occurredOn: Date;

  constructor(public readonly causeId: string) {
    this.occurredOn = new Date();
  }
}
