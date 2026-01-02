import { DomainEvent } from '../event';

export class CommunityProposalAccepted extends DomainEvent {
  constructor(
    public readonly proposalId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly requesterId: string,
  ) {
    super();
  }
}
