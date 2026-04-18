import { Injectable } from '@nestjs/common';
import { CollaborationHistoryRetrieverPort } from '../../domain/ports/collaboration-history-retriever.port';
import { MyCollaborationsDto } from '@app/shared/application/dtos/my-collaborations.dto';
import { CollaborationHistoryPort } from '../ports/collaboration-history.port';
import { GetUserMembershipsPort } from '../ports/get-user-memberships.port';
import { GetMySupportsPort } from '../ports/get-my-supports.port';

@Injectable()
export class CollaborationHistoryService implements CollaborationHistoryPort {
  constructor(
    private readonly collaborationHistoryRetriever: CollaborationHistoryRetrieverPort,
    private readonly getMysupportsService: GetMySupportsPort,
    private readonly userMembershipsRetreiverService: GetUserMembershipsPort,
  ) {}

  async getUserCollaborations(
    userId: string,
    order: 'ASC' | 'DESC',
  ): Promise<MyCollaborationsDto> {
    const [memberships, supports, donations, volunteering] = await Promise.all([
      this.userMembershipsRetreiverService.getUserMemberships(userId),
      this.getMysupportsService.getMySupports(userId),
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
