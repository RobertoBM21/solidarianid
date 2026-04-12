import { DomainEvent } from '@app/shared/domain';

export class FundingActionCreatedEvent implements DomainEvent {
  readonly occurredOn: Date;

  constructor(
    public readonly actionId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly objectives: string[],
    public readonly causeId: string,
    public readonly targetAmount: number,
  ) {
    this.occurredOn = new Date();
  }
}
