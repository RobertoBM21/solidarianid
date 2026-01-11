import { Either } from '@app/shared/domain';
import {
  CommunityProposal,
  InvalidProposalStateError,
} from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { CommunityProposalNotFoundError } from '../../domain/repositories/community-proposal.repository';

export abstract class CommunityProposalsPort {
  abstract listPendingProposals(): Promise<CommunityProposal[]>;

  abstract approve(
    proposalId: string,
  ): Promise<
    Either<
      InvalidProposalStateError | CommunityProposalNotFoundError,
      CommunityProposal
    >
  >;

  abstract reject(
    proposalId: string,
  ): Promise<
    Either<
      InvalidProposalStateError | CommunityProposalNotFoundError,
      CommunityProposal
    >
  >;
}
