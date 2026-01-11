import { CommunityProposal } from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { CommunityProposalCreated } from '@app/shared/domain/events/community-proposal-created.event';
import { Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';
import { CommunityProposalRepository } from '../../domain/repositories/community-proposal.repository';

@EventsHandler(CommunityProposalCreated)
export class CommunityProposalCreatedHandler {
  private readonly logger = new Logger(CommunityProposalCreatedHandler.name);

  constructor(private readonly repository: CommunityProposalRepository) {}

  async handle(event: CommunityProposalCreated) {
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
      this.logger.error(
        `Failed to create community proposal: ${proposal.value.constructor.name}`,
      );
      return;
    }

    await this.repository.save(proposal.value);
  }
}
