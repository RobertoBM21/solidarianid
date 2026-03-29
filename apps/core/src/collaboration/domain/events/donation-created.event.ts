import { DomainEvent } from '@app/shared/domain';

export class DonationCreated extends DomainEvent {
  constructor(
    public readonly fundingActionId: string,
    public readonly amount: number,
  ) {
    super();
  }
}
