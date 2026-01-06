import {
  DomainEventsPort,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import {
  CommunityProposal,
  CommunityProposalCreationError,
  InvalidProposalStateError,
} from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { CommunityProposalCreated } from '@app/shared/domain/events/community-proposal-created.event';
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

  async handleNewProposal(
    event: CommunityProposalCreated,
  ): Promise<Either<CommunityProposalCreationError, void>> {
    this.logger.debug(
      `New community proposal received: ID=${event.proposalId}, Name=${event.name}, RequesterID=${event.requesterId}`,
    );

    const proposal = CommunityProposal.create({
      name: event.name,
      description: event.description,
      requesterId: event.requesterId,
      accepted: null,
      createdAt: new Date(),
    });
    if (proposal.isLeft()) {
      return left(proposal.value);
    }

    await this.repository.save(proposal.value);
    return right(undefined);
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
