import { CommunityProposalRejected } from '@app/shared/domain/events/community-proposal-rejected.event';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';
import { CommunityProposalRepository } from '../../domain/repositories/community-proposal.repository';

@Controller()
@ApiExcludeController()
export class CommunityProposalRejectedConsumer {
  private readonly logger = new Logger(CommunityProposalRejectedConsumer.name);

  constructor(
    private readonly proposalRepository: CommunityProposalRepository,
  ) {}

  @MessagePattern(CommunityProposalRejected.name)
  async handleCommunityProposalRejected(
    event: CommunityProposalRejected,
  ): Promise<void> {
    this.logger.debug(
      `Handling CommunityProposalRejected event - proposalId=${event.proposalId} name='${event.name}'`,
    );
    await this.proposalRepository.updateAcceptedStatus(event.proposalId, false);
  }
}
