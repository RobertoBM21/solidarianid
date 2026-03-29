import { CommunityProposalAccepted } from '@app/shared/domain/events/community-proposal-accepted.event';
import {
  CommunitiesStatisticsData,
  GetCommunitiesStatisticsQuery,
} from '@app/shared/domain/queries/get-communities-statistics.query';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';
import { CommunityStatisticsPort } from '../../../application/ports/community-statistics.port';
import { CommunityFactory } from '../../../domain/services/community-factory.service';

@Controller()
@ApiExcludeController()
export class CommunityEventsController {
  private readonly logger = new Logger(CommunityEventsController.name);

  constructor(
    private readonly communityFactory: CommunityFactory,
    private readonly communityStatisticsPort: CommunityStatisticsPort,
  ) {}

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

  @MessagePattern(GetCommunitiesStatisticsQuery.name)
  async handleGetCommunitiesStatistics(): Promise<CommunitiesStatisticsData> {
    this.logger.debug(`Handling community statistics query`);
    const data = await this.communityStatisticsPort.getCommunitiesStatistics();
    return { data };
  }
}
