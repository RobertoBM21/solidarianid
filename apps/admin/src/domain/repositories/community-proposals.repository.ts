import { DomainError, Repository } from '@app/shared/domain';
import { CommunityProposal } from '@app/shared/domain/aggregates/community-proposal.aggregate';

export class CommunityProposalNotFoundError implements DomainError {
  readonly message: string;
  constructor(public readonly communityProposalId: string) {
    this.message = `Community Proposal with ID ${communityProposalId} not found.`;
  }
}

export abstract class CommunityProposalsRepository extends Repository<
  CommunityProposal,
  CommunityProposalNotFoundError
> {
  abstract findAllPending(): Promise<CommunityProposal[]>;
}
