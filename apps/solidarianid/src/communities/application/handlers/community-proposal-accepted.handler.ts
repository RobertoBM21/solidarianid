import { CommunityProposalAccepted } from '@app/shared/domain/events/community-proposal-accepted.event';
import { Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';
import { CommunityFactory } from '../../domain/services/community-factory.service';

@EventsHandler(CommunityProposalAccepted)
export class CommunityProposalAcceptedHandler {
  private readonly logger = new Logger(CommunityProposalAcceptedHandler.name);

  constructor(private readonly communityFactory: CommunityFactory) {}

  async handle(event: CommunityProposalAccepted): Promise<void> {
    this.logger.debug(
      `Handling CommunityProposalAccepted event - name='${event.name}' requesterId=${event.requesterId}`,
    );
    const result = await this.communityFactory.createCommunity({
      name: event.name,
      description: event.description,
      adminId: event.requesterId,
    });
    if (result.isLeft()) {
      this.logger.error(
        `Failed to create community for proposalId=${event.proposalId}: ${result.value.message}`,
      );
    }
  }
}
