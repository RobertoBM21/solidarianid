import { UserCollaborationHistory } from '@app/shared/domain/queries/get-my-collaborations.query';
import { ReportUserDto } from '../dtos/report-user.dto';

export interface ReportUsersPage {
  users: ReportUserDto[];
  totalPages: number;
}

export abstract class UsersPort {
  abstract listUsers(page?: number, search?: string): Promise<ReportUsersPage>;
  abstract getUserHistory(userId: string): Promise<UserCollaborationHistory>;
}
