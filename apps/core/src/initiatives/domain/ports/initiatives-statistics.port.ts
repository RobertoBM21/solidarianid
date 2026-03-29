import {
  CauseStatisticsRow,
  CommunityActivityRow,
  OdsCount,
} from '@app/shared/domain/queries/get-initiatives-statistics.query';
import { UserSupportHistoryItem } from '@app/shared/domain/queries/get-my-collaborations.query';

export abstract class InitiativesStatisticsPort {
  abstract getOdsCounts(): Promise<OdsCount[]>;
  abstract getActivityData(): Promise<CommunityActivityRow[]>;
  abstract getCauseStatistics(): Promise<CauseStatisticsRow[]>;
  abstract getTotalCausesCount(): Promise<number>;
  abstract getTotalSupportsCount(): Promise<number>;

  abstract getMySupports(userId: string): Promise<UserSupportHistoryItem[]>;
}
