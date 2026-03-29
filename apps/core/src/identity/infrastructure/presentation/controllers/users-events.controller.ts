import {
  GetUsersQuery,
  GetUsersQueryResult,
} from '@app/shared/domain/queries/get-users.query';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';
import { UserPort } from '../../../application/ports/user.port';

@Controller()
@ApiExcludeController()
export class UsersEventsController {
  constructor(private readonly userPort: UserPort) {}

  @MessagePattern(GetUsersQuery.name)
  handleGetUsersQuery(query: GetUsersQuery): Promise<GetUsersQueryResult> {
    return this.userPort.listUsers(query.page, query.search);
  }
}
