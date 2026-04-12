import { DomainEvent } from '@app/shared/domain';

export class CauseSupportRegisteredEvent implements DomainEvent {
  readonly occurredOn: Date;

  constructor(
    public readonly causeId: string,
    public readonly supporterType: 'user' | 'anonymous',
    public readonly supporterId: string,
  ) {
    this.occurredOn = new Date();
  }
}
