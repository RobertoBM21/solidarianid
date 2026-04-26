import {
  CauseStatisticsRow,
  CommunityActivityRow,
  OdsCount,
} from '@app/shared/application/dtos/initiatives-statistics.dto';

export interface CommunityStatsData {
  id: string;
  name: string;
  users: number;
  admins: number;
}

export interface InitiativesStatsData {
  odsCount: OdsCount[];
  activity: CommunityActivityRow[];
  causes: CauseStatisticsRow[];
  totalCauses: number;
  totalSupports: number;
}

export interface CollaborationStatsData {
  totalDonationsMoney: number;
}

export abstract class RawStatisticsPort {
  abstract getCommunitiesStatistics(): Promise<CommunityStatsData[]>;
  abstract getInitiativesStatistics(): Promise<InitiativesStatsData>;
  abstract getCollaborationStatistics(): Promise<CollaborationStatsData>;
}
