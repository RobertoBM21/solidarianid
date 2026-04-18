import { UserCollaborationHistory } from '@app/shared/application/dtos/my-collaborations.dto';

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
