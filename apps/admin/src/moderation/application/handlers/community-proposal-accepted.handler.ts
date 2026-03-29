import { DomainEventsPort } from '@app/shared/domain';
import { CommunityProposalAccepted } from '@app/shared/domain/events/community-proposal-accepted.event';
import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CommunityProposalRepository } from '../../domain/repositories/community-proposal.repository';

@EventsHandler(CommunityProposalAccepted)
export class CommunityProposalAcceptedHandler
  implements IEventHandler<CommunityProposalAccepted>
{
  private readonly logger = new Logger(CommunityProposalAcceptedHandler.name);

  constructor(
    private readonly repository: CommunityProposalRepository,
    private readonly domainEvents: DomainEventsPort,
  ) {}

  async handle(event: CommunityProposalAccepted): Promise<void> {
    this.logger.debug(
      `Handling CommunityProposalAccepted event for proposal ${event.proposalId}`,
    );

    const otherProposals = await this.repository.findPendingByName(event.name);

    for (const proposal of otherProposals) {
      if (proposal.id.toString() !== event.proposalId) {
        const result = proposal.setAccepted(false);
        if (result.isLeft()) {
          this.logger.warn(
            `Failed to reject proposal ${proposal.id.toString()}: ${result.value.message}`,
          );
          continue;
        }

        await this.repository.save(proposal);
        await this.domainEvents.dispatch(proposal);

        this.logger.debug(
          `Rejected duplicate proposal ${proposal.id.toString()} with name "${event.name}"`,
        );
      }
    }
  }
}
