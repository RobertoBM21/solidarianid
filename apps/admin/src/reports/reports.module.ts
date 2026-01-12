import { Module } from '@nestjs/common';
import { StatisticsPort } from './application/ports/statistics.port';
import { UsersPort } from './application/ports/users.port';
import { StatisticsService } from './application/services/statistics.service';
import { UsersService } from './application/services/users.service';
import { DashboardController } from './infrastructure/presentation/controllers/dashboard.controller';
import { ReportsController } from './infrastructure/presentation/controllers/reports.controller';

@Module({
  providers: [
    StatisticsService,
    {
      provide: StatisticsPort,
      useExisting: StatisticsService,
    },
    UsersService,
    {
      provide: UsersPort,
      useExisting: UsersService,
    },
  ],
  controllers: [DashboardController, ReportsController],
})
export class ReportsModule {}
