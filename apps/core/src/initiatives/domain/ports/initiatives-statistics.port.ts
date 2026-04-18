import {
  CauseStatisticsRow,
  CommunityActivityRow,
  OdsCount,
} from '@app/shared/application/dtos/initiatives-statistics.dto';
import { UserSupportHistoryItem } from '@app/shared/application/dtos/my-collaborations.dto';

export abstract class InitiativesStatisticsPort {
  abstract getOdsCounts(): Promise<OdsCount[]>;
  abstract getActivityData(): Promise<CommunityActivityRow[]>;
  abstract getCauseStatistics(): Promise<CauseStatisticsRow[]>;
  abstract getTotalCausesCount(): Promise<number>;
  abstract getTotalSupportsCount(): Promise<number>;

  abstract getMySupports(userId: string): Promise<UserSupportHistoryItem[]>;
}
