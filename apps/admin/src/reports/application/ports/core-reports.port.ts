import { UserCollaborationHistory } from '@app/shared/domain/queries/get-my-collaborations.query';

export interface CoreReportUser {
  id: string;
  name: string;
  communities: string[];
}

export interface CoreReportUsersPage {
  users: CoreReportUser[];
  totalPages: number;
}

export abstract class CoreReportsPort {
  abstract listUsers(
    page?: number,
    search?: string,
  ): Promise<CoreReportUsersPage>;
  abstract getUserContributions(
    userId: string,
  ): Promise<UserCollaborationHistory>;
}
