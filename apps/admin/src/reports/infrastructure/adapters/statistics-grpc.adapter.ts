import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import {
  STATISTICS_SERVICE_NAME,
  StatisticsServiceClient,
} from '@app/shared/infrastructure/grpc/stubs/statistics';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CollaborationStatsData,
  CommunityStatsData,
  InitiativesStatsData,
  RawStatisticsPort,
} from '../../application/ports/raw-statistics.port';

@Injectable()
export class StatisticsGrpcAdapter implements RawStatisticsPort, OnModuleInit {
  private service!: StatisticsServiceClient;

  constructor(
    @Inject(GrpcPackages.Statistics.Client) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.service = this.client.getService<StatisticsServiceClient>(
      STATISTICS_SERVICE_NAME,
    );
  }

  async getCommunitiesStatistics(): Promise<CommunityStatsData[]> {
    const { data } = await firstValueFrom(
      this.service.getCommunitiesStatistics({}),
    );
    return data;
  }

  getInitiativesStatistics(): Promise<InitiativesStatsData> {
    return firstValueFrom(this.service.getInitiativesStatistics({}));
  }

  getCollaborationStatistics(): Promise<CollaborationStatsData> {
    return firstValueFrom(this.service.getCollaborationStatistics({}));
  }
}
