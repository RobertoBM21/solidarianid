import { DomainEvent } from '@app/shared/domain';

export class CauseCreatedEvent implements DomainEvent {
  readonly occurredOn: Date;

  constructor(
    public readonly causeId: string,
    public readonly communityId: string,
  ) {
    this.occurredOn = new Date();
  }
}
