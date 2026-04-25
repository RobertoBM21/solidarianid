import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices/decorators/message-pattern.decorator';
import { RpcException } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';
import { status } from '@grpc/grpc-js';
import type {
  ValidateCredentialsRequest,
  UserIdResponse,
  GoogleUserRequest,
  RegisterUserRequest,
} from '@app/shared/infrastructure/grpc/stubs/auth';
import { UserPort } from '../../application/ports/user.port';

@Controller()
@ApiExcludeController()
export class AuthGrpcController {
  private readonly logger = new Logger(AuthGrpcController.name);

  constructor(private readonly userService: UserPort) {}

  @GrpcMethod(GrpcPackages.Auth.ServiceName)
  async validateCredentials(
    request: ValidateCredentialsRequest,
  ): Promise<UserIdResponse> {
    this.logger.debug(
      `Received validateCredentials request for email: ${request.email}`,
    );
    const result = await this.userService.validateCredentials(
      request.email,
      request.password,
    );
    if (result.isLeft()) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: result.value.message,
      });
    }
    return result.value;
  }

  @GrpcMethod(GrpcPackages.Auth.ServiceName)
  async registerUser(request: RegisterUserRequest): Promise<UserIdResponse> {
    this.logger.debug(
      `Received registerUser request for email: ${request.email}`,
    );
    const result = await this.userService.createLocalUser(request);
    if (result.isLeft()) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: result.value.message,
      });
    }
    return { userId: result.value.id };
  }

  @GrpcMethod(GrpcPackages.Auth.ServiceName)
  async findOrCreateGoogleUser(
    request: GoogleUserRequest,
  ): Promise<UserIdResponse> {
    this.logger.debug(
      `Received findOrCreateGoogleUser request for email: ${request.email}`,
    );
    const result = await this.userService.findOrCreateGoogleUser(
      request.email,
      request.name,
    );
    if (result.isLeft()) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: result.value.message,
      });
    }
    return result.value;
  }
}
