import { Injectable, Logger } from '@nestjs/common';
import { CommunityProposalRepository } from '../../domain/repositories/community-proposal.repository';
import { CreateCommunityPort } from '../ports/create-community.port';
import { HandleCommunityProposalAcceptedPort } from '../ports/handle-community-proposal-accepted.port';

@Injectable()
export class HandleCommunityProposalAcceptedService extends HandleCommunityProposalAcceptedPort {
  private readonly logger = new Logger(
    HandleCommunityProposalAcceptedService.name,
  );

  constructor(
    private readonly createCommunity: CreateCommunityPort,
    private readonly proposalRepository: CommunityProposalRepository,
  ) {
    super();
  }

  async handle(data: {
    name: string;
    description: string;
    requesterId: string;
    proposalId: string;
  }): Promise<void> {
    const result = await this.createCommunity.createCommunity({
      name: data.name,
      description: data.description,
      adminId: data.requesterId,
    });
    if (result.isLeft()) {
      this.logger.error(
        `Failed to create community for proposalId=${data.proposalId}: ${result.value.message}`,
      );
      return;
    }
    await this.proposalRepository.updateAcceptedStatus(data.proposalId, true);
  }
}
