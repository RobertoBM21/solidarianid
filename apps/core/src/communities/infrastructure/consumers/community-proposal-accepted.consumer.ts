import { CommunityProposalAccepted } from '@app/shared/domain/events/community-proposal-accepted.event';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';
import { HandleCommunityProposalAcceptedPort } from '../../application/ports/handle-community-proposal-accepted.port';

@Controller()
@ApiExcludeController()
export class CommunityProposalAcceptedConsumer {
  private readonly logger = new Logger(CommunityProposalAcceptedConsumer.name);

  constructor(
    private readonly handleProposalAccepted: HandleCommunityProposalAcceptedPort,
  ) {}

  @MessagePattern(CommunityProposalAccepted.name)
  async handleCommunityProposalAccepted(
    event: CommunityProposalAccepted,
  ): Promise<void> {
    this.logger.debug(
      `Handling CommunityProposalAccepted event - name='${event.name}' requesterId=${event.requesterId}`,
    );
    await this.handleProposalAccepted.handle({
      name: event.name,
      description: event.description,
      requesterId: event.requesterId,
      proposalId: event.proposalId,
    });
  }
}
