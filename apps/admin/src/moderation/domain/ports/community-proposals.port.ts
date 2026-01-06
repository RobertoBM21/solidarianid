import { Either, UniqueEntityID } from '@app/shared/domain';
import {
  CommunityProposal,
  CommunityProposalCreationError,
  InvalidProposalStateError,
} from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { CommunityProposalCreated } from '@app/shared/domain/events/community-proposal-created.event';
import { CommunityProposalNotFoundError } from '../repositories/community-proposal.repository';

export abstract class CommunityProposalsPort {
  abstract listPendingProposals(): Promise<CommunityProposal[]>;

  abstract handleNewProposal(
    event: CommunityProposalCreated,
  ): Promise<Either<CommunityProposalCreationError, void>>;

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
