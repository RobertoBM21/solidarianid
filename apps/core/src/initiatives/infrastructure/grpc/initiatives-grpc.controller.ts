import { InitiativesStatisticsData } from '@app/shared/application/dtos/initiatives-statistics.dto';
import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';
import { InitiativesStatisticsPort } from '../../domain/ports/initiatives-statistics.port';

@Controller()
@ApiExcludeController()
export class InitiativesGrpcController {
  private readonly logger = new Logger(InitiativesGrpcController.name);
  constructor(private readonly statisticsPort: InitiativesStatisticsPort) {}

  @GrpcMethod(GrpcPackages.Statistics.ServiceName)
  async getInitiativesStatistics(): Promise<InitiativesStatisticsData> {
    this.logger.debug('Received initiatives statistics query via gRPC');
    const [odsCount, activity, causesStats, totalCauses, totalSupports] =
      await Promise.all([
        this.statisticsPort.getOdsCounts(),
        this.statisticsPort.getActivityData(),
        this.statisticsPort.getCauseStatistics(),
        this.statisticsPort.getTotalCausesCount(),
        this.statisticsPort.getTotalSupportsCount(),
      ]);

    return {
      odsCount,
      activity,
      causes: causesStats,
      totalCauses,
      totalSupports,
    };
  }
}
