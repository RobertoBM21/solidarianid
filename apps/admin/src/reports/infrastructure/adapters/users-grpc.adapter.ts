import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import {
  IDENTITY_SERVICE_NAME,
  IdentityServiceClient,
} from '@app/shared/infrastructure/grpc/stubs/identity';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices/interfaces/client-grpc.interface';
import { firstValueFrom } from 'rxjs';
import { ReportUserDto } from '../../application/dtos/report-user.dto';
import { ReportUsersPage, UsersPort } from '../../application/ports/users.port';

@Injectable()
export class UsersGrpcAdapter implements UsersPort, OnModuleInit {
  private readonly logger = new Logger(UsersGrpcAdapter.name);

  private identityService!: IdentityServiceClient;

  constructor(
    @Inject(GrpcPackages.Identity.Client)
    private readonly identityGrpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.identityService =
      this.identityGrpcClient.getService<IdentityServiceClient>(
        IDENTITY_SERVICE_NAME,
      );
  }

  async listUsers(page?: number, search?: string): Promise<ReportUsersPage> {
    this.logger.debug('Fetching users from gRPC service...');
    const response = await firstValueFrom(
      this.identityService.listUsers({ page, search }),
    );
    const users: ReportUserDto[] = response.users.map(
      (user) => new ReportUserDto(user.id, user.name, user.communities),
    );
    const reportUsersPage: ReportUsersPage = {
      users,
      totalPages: response.totalPages,
    };
    return reportUsersPage;
  }
}
