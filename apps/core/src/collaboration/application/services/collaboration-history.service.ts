import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetMyMembershipsQuery } from '../../../communities/application/queries/get-my-memberships.query';
import { GetMySupportsQuery } from '../../../initiatives/application/queries/get-my-supports.query';
import { CollaborationHistoryRetrieverPort } from '../../domain/ports/collaboration-history-retriever.port';
import { MyCollaborationsDto } from '../dtos/my-collaborations.dto';
import { CollaborationHistoryPort } from '../ports/collaboration-history.port';

@Injectable()
export class CollaborationHistoryService implements CollaborationHistoryPort {
  constructor(
    private readonly collaborationHistoryRetriever: CollaborationHistoryRetrieverPort,
    private readonly queryBus: QueryBus,
  ) {}

  async getUserCollaborations(
    userId: string,
    order: 'ASC' | 'DESC',
  ): Promise<MyCollaborationsDto> {
    const [memberships, supports, donations, volunteering] = await Promise.all([
      this.queryBus.execute(new GetMyMembershipsQuery(userId)),
      this.queryBus.execute(new GetMySupportsQuery(userId)),
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
