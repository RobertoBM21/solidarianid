import { CommunitiesStatisticsData } from '@app/shared/domain/queries/get-communities-statistics.query';
import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';
import { CommunityStatisticsPort } from '../../application/ports/community-statistics.port';

@Controller()
@ApiExcludeController()
export class CommunitiesGrpcController {
  private readonly logger = new Logger(CommunitiesGrpcController.name);

  constructor(
    private readonly communityStatisticsPort: CommunityStatisticsPort,
  ) {}

  @GrpcMethod(GrpcPackages.Statistics.ServiceName)
  async getCommunitiesStatistics(): Promise<CommunitiesStatisticsData> {
    this.logger.debug(`Handling community statistics query`);
    const data = await this.communityStatisticsPort.getCommunitiesStatistics();
    return { data };
  }
}
