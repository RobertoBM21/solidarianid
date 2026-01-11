import {
  DomainEventError,
  DomainEventsPort,
  Either,
  left,
  right,
} from '@app/shared/domain';
import {
  CollaborationStatisticsData,
  GetCollaborationStatisticsQuery,
} from '@app/shared/domain/queries/get-collaboration-statistics.query';
import {
  CommunitiesStatisticsData,
  GetCommunitiesStatisticsQuery,
} from '@app/shared/domain/queries/get-communities-statistics.query';
import {
  CauseStatisticsRow,
  GetInitiativesStatisticsQuery,
  InitiativesStatisticsData,
} from '@app/shared/domain/queries/get-initiatives-statistics.query';
import { Injectable } from '@nestjs/common';
import { CommunityStatistics, StatisticsDto } from '../dtos/statistics.dto';
import { StatisticsPort } from '../ports/statistics.port';

@Injectable()
export class StatisticsService implements StatisticsPort {
  constructor(private readonly domainEvents: DomainEventsPort) {}

  async getGlobalStatistics(): Promise<
    Either<DomainEventError, StatisticsDto>
  > {
    const [communitiesOrError, initiativesOrError, collaborationOrError] =
      await Promise.all([
        this.domainEvents.query<CommunitiesStatisticsData>(
          new GetCommunitiesStatisticsQuery(),
        ),
        this.domainEvents.query<InitiativesStatisticsData>(
          new GetInitiativesStatisticsQuery(),
        ),
        this.domainEvents.query<CollaborationStatisticsData>(
          new GetCollaborationStatisticsQuery(),
        ),
      ]);
    if (communitiesOrError.isLeft()) {
      return left(communitiesOrError.value);
    }
    if (initiativesOrError.isLeft()) {
      return left(initiativesOrError.value);
    }
    if (collaborationOrError.isLeft()) {
      return left(collaborationOrError.value);
    }

    const totals: StatisticsDto['totals'] = {
      causes: initiativesOrError.value.totalCauses,
      communities: communitiesOrError.value.data.length,
      donations: collaborationOrError.value.totalDonationsMoney,
      supports: initiativesOrError.value.totalSupports,
    };

    const odsCounts: Record<number, number> = {};
    for (const odsCount of initiativesOrError.value.odsCount) {
      odsCounts[odsCount.ods] = odsCount.count;
    }

    const dto = new StatisticsDto(
      totals,
      this.buildCommunityStatistics(
        communitiesOrError.value,
        initiativesOrError.value,
      ),
      initiativesOrError.value.activity,
      odsCounts,
    );
    return right(dto);
  }

  private buildCommunityStatistics(
    communityData: CommunitiesStatisticsData,
    initiativesData: InitiativesStatisticsData,
  ): CommunityStatistics[] {
    const initiativesMap = new Map<string, CauseStatisticsRow>(
      initiativesData.causes.map((c) => [c.communityId, c]),
    );

    return communityData.data.map((community) => {
      const initiativesStats = initiativesMap.get(community.id);
      return {
        name: community.name,
        users: community.users,
        admins: community.admins,
        activeCauses: initiativesStats?.activeCauses ?? 0,
        closedCauses: initiativesStats?.closedCauses ?? 0,
        odsCovered: initiativesStats?.odsCovered ?? 0,
        supports: initiativesStats?.supports ?? 0,
      };
    });
  }
}
