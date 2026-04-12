import { DomainEvent } from '@app/shared/domain';

export class VolunteeringActionCreatedEvent implements DomainEvent {
  readonly occurredOn: Date;

  constructor(
    public readonly actionId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly objectives: string[],
    public readonly causeId: string,
    public readonly start: Date,
    public readonly end: Date,
  ) {
    this.occurredOn = new Date();
  }
}
