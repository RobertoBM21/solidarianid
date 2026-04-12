import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import type {
  Pagination,
  ReportUsersPage,
} from '@app/shared/infrastructure/grpc/stubs/reports';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';
import { UserPort } from '../../application/ports/user.port';

@Controller()
@ApiExcludeController()
export class UsersGrpcController {
  constructor(private readonly userPort: UserPort) {}

  @GrpcMethod(GrpcPackages.Reports.ServiceName)
  listUsers(pagination: Pagination): Promise<ReportUsersPage> {
    return this.userPort.listUsers(pagination.page, pagination.search);
  }
}
