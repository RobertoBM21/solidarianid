export interface OdsCount {
  ods: number;
  count: number;
}

export interface CommunityActivityRow {
  month: number;
  year: number;
  communityId: string;
  newCauses: number;
}

export interface CauseStatisticsRow {
  communityId: string;
  activeCauses: number;
  closedCauses: number;
  odsCovered: number;
  supports: number;
}

export interface InitiativesStatisticsData {
  odsCount: OdsCount[];
  activity: CommunityActivityRow[];
  causes: CauseStatisticsRow[];
  totalCauses: number;
  totalSupports: number;
}
