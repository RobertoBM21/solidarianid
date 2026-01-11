import {
  DomainEventsPort,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import {
  CommunityProposal,
  InvalidProposalStateError,
} from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { Injectable, Logger } from '@nestjs/common';
import { CommunityProposalsPort } from '../../domain/ports/community-proposals.port';
import {
  CommunityProposalNotFoundError,
  CommunityProposalRepository,
} from '../../domain/repositories/community-proposal.repository';

@Injectable()
export class CommunityProposalsService implements CommunityProposalsPort {
  private readonly logger = new Logger(CommunityProposalsService.name);

  constructor(
    private readonly domainEvents: DomainEventsPort,
    private readonly repository: CommunityProposalRepository,
  ) {}

  async listPendingProposals(): Promise<CommunityProposal[]> {
    return this.repository.findAllPending();
  }

  async approve(
    proposalId: UniqueEntityID,
  ): Promise<
    Either<
      InvalidProposalStateError | CommunityProposalNotFoundError,
      CommunityProposal
    >
  > {
    return this.setProposalAcceptedStatus(proposalId, true);
  }

  async reject(
    proposalId: UniqueEntityID,
  ): Promise<
    Either<
      InvalidProposalStateError | CommunityProposalNotFoundError,
      CommunityProposal
    >
  > {
    return this.setProposalAcceptedStatus(proposalId, false);
  }

  private async setProposalAcceptedStatus(
    proposalId: UniqueEntityID,
    accepted: boolean,
  ): Promise<
    Either<
      InvalidProposalStateError | CommunityProposalNotFoundError,
      CommunityProposal
    >
  > {
    const proposalOrError = await this.repository.findById(proposalId);
    if (proposalOrError.isLeft()) {
      return proposalOrError;
    }
    const proposal = proposalOrError.value;

    const result = proposal.setAccepted(accepted);
    if (result.isLeft()) {
      return left(result.value);
    }

    await this.repository.save(proposal);
    await this.domainEvents.dispatch(proposal);
    return right(proposal);
  }
}
