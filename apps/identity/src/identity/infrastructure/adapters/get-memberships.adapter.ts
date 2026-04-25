import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import { type CommunitiesServiceClient } from '@app/shared/infrastructure/grpc/stubs/communities';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GetMembershipsPort } from '../../application/ports/get-memberships.port';

@Injectable()
export class GetMembershipsAdapter implements OnModuleInit, GetMembershipsPort {
  private service: CommunitiesServiceClient;

  constructor(
    @Inject(GrpcPackages.Communities.Client)
    private readonly communitiesClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.service = this.communitiesClient.getService<CommunitiesServiceClient>(
      GrpcPackages.Communities.ServiceName,
    );
  }

  async getMemberships(userIds: string[]): Promise<Map<string, string[]>> {
    const response = await firstValueFrom(
      this.service.getMemberships({ userIds }),
    );
    return new Map(
      response.memberships.map(({ userId, communities }) => [
        userId,
        communities,
      ]),
    );
  }
}
