import { DomainEventsPort } from '@app/shared/domain';
import {
  GetMyCollaborationsQuery,
  UserCollaborationHistory,
} from '@app/shared/domain/queries/get-my-collaborations.query';
import {
  GetUsersQuery,
  GetUsersQueryResult,
} from '@app/shared/domain/queries/get-users.query';
import { Injectable } from '@nestjs/common';
import { ReportUserDto } from '../dtos/report-user.dto';
import { ReportUsersPage, UsersPort } from '../ports/users.port';

@Injectable()
export class UsersService implements UsersPort {
  constructor(private readonly domainEvents: DomainEventsPort) {}

  async listUsers(page?: number, search?: string): Promise<ReportUsersPage> {
    const usersOrError = await this.domainEvents.query<GetUsersQueryResult>(
      new GetUsersQuery(page, search),
    );
    if (usersOrError.isLeft()) {
      return { users: [], totalPages: 1 };
    }
    const users = usersOrError.value.users.map(
      (user) => new ReportUserDto(user.id, user.name, user.communities),
    );
    return {
      users,
      totalPages: usersOrError.value.totalPages,
    };
  }

  async getUserHistory(userId: string): Promise<UserCollaborationHistory> {
    const userHistoryOrError =
      await this.domainEvents.query<UserCollaborationHistory>(
        new GetMyCollaborationsQuery(userId),
      );
    if (userHistoryOrError.isLeft()) {
      return { items: [] };
    }
    return userHistoryOrError.value;
  }
}
