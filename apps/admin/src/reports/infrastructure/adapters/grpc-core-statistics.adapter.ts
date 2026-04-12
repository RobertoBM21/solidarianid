import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import {
  CollaborationStatisticsData,
  CommunitiesStatisticsData,
  InitiativesStatisticsData,
  STATISTICS_SERVICE_NAME,
  StatisticsServiceClient,
} from '@app/shared/infrastructure/grpc/stubs/statistics';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CoreCollaborationStatisticsData,
  CoreCommunitiesStatisticsData,
  CoreInitiativesStatisticsData,
  CoreStatisticsPort,
} from '../../application/ports/core-statistics.port';

@Injectable()
export class GrpcCoreStatisticsAdapter
  implements CoreStatisticsPort, OnModuleInit
{
  private service!: StatisticsServiceClient;

  constructor(
    @Inject(GrpcPackages.Statistics.Client) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.service = this.client.getService<StatisticsServiceClient>(
      STATISTICS_SERVICE_NAME,
    );
  }

  async getCommunitiesStatistics(): Promise<CoreCommunitiesStatisticsData> {
    const response: CommunitiesStatisticsData = await firstValueFrom(
      this.service.getCommunitiesStatistics({}),
    );

    return {
      data: response.data,
    };
  }

  async getInitiativesStatistics(): Promise<CoreInitiativesStatisticsData> {
    const response: InitiativesStatisticsData = await firstValueFrom(
      this.service.getInitiativesStatistics({}),
    );

    return {
      odsCount: response.odsCount,
      activity: response.activity,
      causes: response.causes,
      totalCauses: response.totalCauses,
      totalSupports: response.totalSupports,
    };
  }

  async getCollaborationStatistics(): Promise<CoreCollaborationStatisticsData> {
    const response: CollaborationStatisticsData = await firstValueFrom(
      this.service.getCollaborationStatistics({}),
    );

    return {
      totalDonationsMoney: response.totalDonationsMoney,
    };
  }
}
