import { MyCollaborationsDto } from '@app/shared/application/dtos/my-collaborations.dto';
import { Injectable } from '@nestjs/common';
import { CollaborationHistoryRetrieverPort } from '../../domain/ports/collaboration-history-retriever.port';
import { InitiativesStatisticsPort } from '../../domain/ports/initiatives-statistics.port';
import { CollaborationHistoryPort } from '../ports/collaboration-history.port';
import { GetUserMembershipsPort } from '../ports/get-user-memberships.port';

@Injectable()
export class CollaborationHistoryService implements CollaborationHistoryPort {
  constructor(
    private readonly collaborationHistoryRetriever: CollaborationHistoryRetrieverPort,
    private readonly statisticsPort: InitiativesStatisticsPort,
    private readonly userMembershipsRetriever: GetUserMembershipsPort,
  ) {}

  async getUserCollaborations(
    userId: string,
    order: 'ASC' | 'DESC',
  ): Promise<MyCollaborationsDto> {
    const [memberships, supports, donations, volunteering] = await Promise.all([
      this.userMembershipsRetriever.getUserMemberships(userId),
      this.statisticsPort.getMySupports(userId),
      this.collaborationHistoryRetriever.getUserDonations(userId),
      this.collaborationHistoryRetriever.getUserVolunteering(userId),
    ]);

    return new MyCollaborationsDto(
      memberships,
      supports,
      donations,
      volunteering,
      order,
    );
  }
}
