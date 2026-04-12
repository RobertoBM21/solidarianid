import { DomainEventError, Either, left, right } from '@app/shared/domain';
import { CauseStatisticsRow } from '@app/shared/domain/queries/get-initiatives-statistics.query';
import { Injectable, Logger } from '@nestjs/common';
import { CommunityStatistics, StatisticsDto } from '../dtos/statistics.dto';
import {
  CoreCollaborationStatisticsData as CollaborationStatisticsData,
  CoreCommunitiesStatisticsData as CommunitiesStatisticsData,
  CoreInitiativesStatisticsData as InitiativesStatisticsData,
  CoreStatisticsPort,
} from '../ports/core-statistics.port';
import { StatisticsPort } from '../ports/statistics.port';

@Injectable()
export class StatisticsService implements StatisticsPort {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(private readonly coreStatisticsService: CoreStatisticsPort) {}

  async getGlobalStatistics(): Promise<
    Either<DomainEventError, StatisticsDto>
  > {
    let communitiesData: CommunitiesStatisticsData;
    let initiativesData: InitiativesStatisticsData;
    let collaborationData: CollaborationStatisticsData;

    try {
      this.logger.debug('Fetching global statistics from gRPC service...');
      [communitiesData, initiativesData, collaborationData] = await Promise.all(
        [
          this.coreStatisticsService.getCommunitiesStatistics(),
          this.coreStatisticsService.getInitiativesStatistics(),
          this.coreStatisticsService.getCollaborationStatistics(),
        ],
      );
    } catch (error) {
      this.logger.error('Failed to fetch statistics from gRPC service:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to fetch statistics';
      return left(new DomainEventError(message));
    }

    const totals: StatisticsDto['totals'] = {
      causes: initiativesData.totalCauses,
      communities: communitiesData.data.length,
      donations: collaborationData.totalDonationsMoney,
      supports: initiativesData.totalSupports,
    };

    const odsCounts: Record<number, number> = {};
    for (const odsCount of initiativesData.odsCount) {
      odsCounts[odsCount.ods] = odsCount.count;
    }

    const dto = new StatisticsDto(
      totals,
      this.buildCommunityStatistics(communitiesData, initiativesData),
      initiativesData.activity,
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
