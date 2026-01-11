import { DomainEvent } from '../event';

export interface CollaborationStatisticsData {
  totalDonationsMoney: number;
}

export class GetCollaborationStatisticsQuery extends DomainEvent {}
