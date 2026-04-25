import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import type {
  GetUserRequest,
  Pagination,
  UserProfile,
  UsersList,
} from '@app/shared/infrastructure/grpc/stubs/identity';
import { status } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';
import { UserPort } from '../../application/ports/user.port';

@Controller()
@ApiExcludeController()
export class IdentityGrpcController {
  constructor(private readonly userPort: UserPort) {}

  @GrpcMethod(GrpcPackages.Identity.ServiceName)
  listUsers(pagination: Pagination): Promise<UsersList> {
    return this.userPort.listUsers(pagination.page, pagination.search);
  }

  @GrpcMethod(GrpcPackages.Identity.ServiceName)
  async getUser(request: GetUserRequest): Promise<UserProfile> {
    const userOrError = await this.userPort.getProfile(request.userId);
    if (userOrError.isLeft()) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: userOrError.value.message,
      });
    }
    return userOrError.value;
  }
}
