export interface CommunityStatisticsRow {
  id: string;
  name: string;
  users: number;
  admins: number;
}

export abstract class CommunityStatisticsPort {
  abstract getCommunitiesStatistics(): Promise<CommunityStatisticsRow[]>;
}
