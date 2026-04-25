import { ProfileOutDto } from '@app/shared/application/dtos/profile-out.dto';
import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import { type IdentityServiceClient } from '@app/shared/infrastructure/grpc/stubs/identity';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GetUserPort } from '../application/ports/get-user.port';

@Injectable()
export class GetUserIntegrationAdapter implements OnModuleInit, GetUserPort {
  private service: IdentityServiceClient;

  constructor(
    @Inject(GrpcPackages.Identity.Client)
    private readonly identityClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.service = this.identityClient.getService<IdentityServiceClient>(
      GrpcPackages.Identity.ServiceName,
    );
  }

  getUser(userId: string): Promise<ProfileOutDto | null> {
    return firstValueFrom(this.service.getUser({ userId }));
  }
}
