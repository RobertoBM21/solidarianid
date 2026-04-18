import { UserCollaborationHistory } from '@app/shared/application/dtos/my-collaborations.dto';
import { ReportUserDto } from '../dtos/report-user.dto';

export interface ReportUsersPage {
  users: ReportUserDto[];
  totalPages: number;
}

export abstract class UsersPort {
  abstract listUsers(page?: number, search?: string): Promise<ReportUsersPage>;
  abstract getUserHistory(userId: string): Promise<UserCollaborationHistory>;
}
