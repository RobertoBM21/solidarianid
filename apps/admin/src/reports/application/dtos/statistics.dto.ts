import { CommunityActivityRow } from '@app/shared/domain/queries/get-initiatives-statistics.query';

export interface CommunityStatistics {
  name: string;
  users: number;
  admins: number;
  activeCauses: number;
  closedCauses: number;
  odsCovered: number;
  supports: number;
}

export class StatisticsDto {
  constructor(
    public readonly totals: {
      donations: number;
      supports: number;
      causes: number;
      communities: number;
    },
    public readonly communities: CommunityStatistics[],
    public readonly activity: CommunityActivityRow[],
    public readonly odsCount: Record<number, number>, // ODS number -> count
  ) {}
}
