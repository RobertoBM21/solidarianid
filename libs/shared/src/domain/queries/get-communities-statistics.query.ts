import { DomainEvent } from '../event';

export interface CommunitiesStatisticsData {
  data: {
    id: string;
    name: string;
    users: number;
    admins: number;
  }[];
}

export class GetCommunitiesStatisticsQuery extends DomainEvent {}
