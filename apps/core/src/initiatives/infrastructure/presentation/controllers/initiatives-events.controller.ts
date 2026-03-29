import {
  GetInitiativesStatisticsQuery,
  InitiativesStatisticsData,
} from '@app/shared/domain/queries/get-initiatives-statistics.query';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';
import { InitiativesStatisticsPort } from '../../../domain/ports/initiatives-statistics.port';

@Controller()
@ApiExcludeController()
export class InitiativesEventsController {
  constructor(private readonly statisticsPort: InitiativesStatisticsPort) {}

  @MessagePattern(GetInitiativesStatisticsQuery.name)
  async handleGetInitiativesStatistics(): Promise<InitiativesStatisticsData> {
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
