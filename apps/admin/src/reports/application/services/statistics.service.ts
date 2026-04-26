import { CauseStatisticsRow } from '@app/shared/application/dtos/initiatives-statistics.dto';
import { DomainEventError, Either, left, right } from '@app/shared/domain';
import { Injectable, Logger } from '@nestjs/common';
import { CommunityStatistics, StatisticsDto } from '../dtos/statistics.dto';
import {
  CollaborationStatsData,
  CommunityStatsData,
  InitiativesStatsData,
  RawStatisticsPort,
} from '../ports/raw-statistics.port';
import { StatisticsPort } from '../ports/statistics.port';

@Injectable()
export class StatisticsService implements StatisticsPort {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(private readonly rawStatisticsService: RawStatisticsPort) {}

  async getGlobalStatistics(): Promise<
    Either<DomainEventError, StatisticsDto>
  > {
    let communitiesData: CommunityStatsData[];
    let initiativesData: InitiativesStatsData;
    let collaborationData: CollaborationStatsData;

    try {
      this.logger.debug('Fetching global statistics...');
      [communitiesData, initiativesData, collaborationData] = await Promise.all(
        [
          this.rawStatisticsService.getCommunitiesStatistics(),
          this.rawStatisticsService.getInitiativesStatistics(),
          this.rawStatisticsService.getCollaborationStatistics(),
        ],
      );
    } catch (error) {
      this.logger.error('Failed to fetch statistics data:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to fetch statistics';
      return left(new DomainEventError(message));
    }

    const totals: StatisticsDto['totals'] = {
      causes: initiativesData.totalCauses,
      communities: communitiesData.length,
      donations: collaborationData.totalDonationsMoney,
      supports: initiativesData.totalSupports,
    };

    const odsCounts: Record<number, number> = {};
    for (const odsCount of initiativesData.odsCount) {
      odsCounts[odsCount.ods] = odsCount.count;
    }

    const dto = new StatisticsDto(
      totals,
      this.buildCommunitiesStatistics(communitiesData, initiativesData),
      initiativesData.activity,
      odsCounts,
    );
    return right(dto);
  }

  private buildCommunitiesStatistics(
    communities: CommunityStatsData[],
    initiativesData: InitiativesStatsData,
  ): CommunityStatistics[] {
    const initiativesMap = new Map<string, CauseStatisticsRow>(
      initiativesData.causes.map((c) => [c.communityId, c]),
    );

    return communities.map((community) => {
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
