import { DomainEvent } from '../event';

export class CommunityProposalRejected extends DomainEvent {
  constructor(
    public readonly proposalId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly requesterId: string,
  ) {
    super();
  }
}
