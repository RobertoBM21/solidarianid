import { CommunityProposalAccepted } from '@app/shared/domain/events/community-proposal-accepted.event';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';
import { CommunityFactory } from '../../domain/services/community-factory.service';

@Controller()
@ApiExcludeController()
export class CommunityProposalAcceptedConsumer {
  private readonly logger = new Logger(CommunityProposalAcceptedConsumer.name);

  constructor(private readonly communityFactory: CommunityFactory) {}

  @MessagePattern(CommunityProposalAccepted.name)
  async handleCommunityProposalAccepted(
    event: CommunityProposalAccepted,
  ): Promise<void> {
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
