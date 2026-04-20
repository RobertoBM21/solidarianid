import { DomainError, Repository } from '@app/shared/domain';
import { CommunityProposal } from '@app/shared/domain/aggregates/community-proposal.aggregate';

export class CommunityProposalNotFoundError implements DomainError {
  readonly message: string;
  constructor(public readonly proposalId: string) {
    this.message = `Community proposal with ID ${proposalId} not found.`;
  }
}

export abstract class CommunityProposalRepository extends Repository<
  CommunityProposal,
  CommunityProposalNotFoundError
> {
  abstract updateAcceptedStatus(
    proposalId: string,
    accepted: boolean,
  ): Promise<void>;
}
