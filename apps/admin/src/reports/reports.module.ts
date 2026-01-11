import { Module } from '@nestjs/common';
import { StatisticsPort } from './application/ports/statistics.port';
import { StatisticsService } from './application/services/statistics.service';
import { DashboardController } from './infrastructure/presentation/controllers/dashboard.controller';
import { ReportsController } from './infrastructure/presentation/controllers/reports.controller';

@Module({
  providers: [
    StatisticsService,
    {
      provide: StatisticsPort,
      useExisting: StatisticsService,
    },
  ],
  controllers: [DashboardController, ReportsController],
})
export class ReportsModule {}
