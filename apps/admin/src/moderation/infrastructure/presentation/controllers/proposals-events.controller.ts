import { CommunityProposal } from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { CommunityProposalCreated } from '@app/shared/domain/events/community-proposal-created.event';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { CommunityProposalRepository } from '../../../domain/repositories/community-proposal.repository';

@Controller()
export class ProposalsEventsController {
  private readonly logger = new Logger(ProposalsEventsController.name);

  constructor(private readonly repository: CommunityProposalRepository) {}

  @EventPattern(CommunityProposalCreated.name)
  async handleProposalCreated(event: CommunityProposalCreated) {
    this.logger.debug(
      `New community proposal received: ID=${event.proposalId}, Name=${event.name}, RequesterID=${event.requesterId}`,
    );

    const proposal = CommunityProposal.create(
      {
        name: event.name,
        description: event.description,
        requesterId: event.requesterId,
        accepted: null,
        createdAt: new Date(),
      },
      event.proposalId,
    );
    if (proposal.isLeft()) {
      this.logger.error(
        `Failed to create community proposal: ${proposal.value.constructor.name}`,
      );
      return;
    }

    await this.repository.save(proposal.value);
  }
}
