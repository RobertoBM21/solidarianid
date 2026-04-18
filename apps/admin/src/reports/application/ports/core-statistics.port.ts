import {
  CauseStatisticsRow,
  CommunityActivityRow,
  OdsCount,
} from '@app/shared/application/dtos/initiatives-statistics.dto';

export interface CoreCommunityData {
  id: string;
  name: string;
  users: number;
  admins: number;
}

export interface CoreCommunitiesStatisticsData {
  data: CoreCommunityData[];
}

export interface CoreInitiativesStatisticsData {
  odsCount: OdsCount[];
  activity: CommunityActivityRow[];
  causes: CauseStatisticsRow[];
  totalCauses: number;
  totalSupports: number;
}

export interface CoreCollaborationStatisticsData {
  totalDonationsMoney: number;
}

export abstract class CoreStatisticsPort {
  abstract getCommunitiesStatistics(): Promise<CoreCommunitiesStatisticsData>;
  abstract getInitiativesStatistics(): Promise<CoreInitiativesStatisticsData>;
  abstract getCollaborationStatistics(): Promise<CoreCollaborationStatisticsData>;
}
