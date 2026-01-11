import { Either, UniqueEntityID } from '@app/shared/domain';
import {
  CommunityProposal,
  InvalidProposalStateError,
} from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { CommunityProposalNotFoundError } from '../repositories/community-proposal.repository';

export abstract class CommunityProposalsPort {
  abstract listPendingProposals(): Promise<CommunityProposal[]>;

  abstract approve(
    proposalId: UniqueEntityID,
  ): Promise<
    Either<
      InvalidProposalStateError | CommunityProposalNotFoundError,
      CommunityProposal
    >
  >;

  abstract reject(
    proposalId: UniqueEntityID,
  ): Promise<
    Either<
      InvalidProposalStateError | CommunityProposalNotFoundError,
      CommunityProposal
    >
  >;
}
