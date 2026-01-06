import { DomainEvent } from '@app/shared/domain';

export class CauseCreated implements DomainEvent {
  readonly occurredOn: Date;

  constructor(
    public readonly causeId: string,
    public readonly communityId: string,
  ) {
    this.occurredOn = new Date();
  }
}
