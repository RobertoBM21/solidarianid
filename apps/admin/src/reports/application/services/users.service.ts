import { UserCollaborationHistory } from '@app/shared/domain/queries/get-my-collaborations.query';
import { Injectable } from '@nestjs/common';
import { ReportUserDto } from '../dtos/report-user.dto';
import { CoreReportsPort } from '../ports/core-reports.port';
import { ReportUsersPage, UsersPort } from '../ports/users.port';

@Injectable()
export class UsersService implements UsersPort {
  constructor(private readonly coreReportsService: CoreReportsPort) {}

  async listUsers(page?: number, search?: string): Promise<ReportUsersPage> {
    const response = await this.coreReportsService.listUsers(page, search);
    const users: ReportUserDto[] = response.users.map(
      (user) => new ReportUserDto(user.id, user.name, user.communities),
    );
    const reportUsersPage: ReportUsersPage = {
      users,
      totalPages: response.totalPages,
    };
    return reportUsersPage;
  }

  async getUserHistory(userId: string): Promise<UserCollaborationHistory> {
    const userHistory =
      await this.coreReportsService.getUserContributions(userId);
    return userHistory;
  }
}
