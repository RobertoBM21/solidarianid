import { DomainEvent } from '../event';

export class CommunityProposalCreated extends DomainEvent {
  constructor(
    public readonly proposalId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly requesterId: string,
  ) {
    super();
  }
}
