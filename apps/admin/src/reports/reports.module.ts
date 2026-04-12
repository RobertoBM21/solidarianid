import { Module } from '@nestjs/common';
import { StatisticsPort } from './application/ports/statistics.port';
import { UsersPort } from './application/ports/users.port';
import { StatisticsService } from './application/services/statistics.service';
import { UsersService } from './application/services/users.service';
import { CoreReportsPort } from './application/ports/core-reports.port';
import { CoreStatisticsPort } from './application/ports/core-statistics.port';
import { DashboardController } from './infrastructure/presentation/controllers/dashboard.controller';
import { ReportsController } from './infrastructure/presentation/controllers/reports.controller';
import { GrpcCoreReportsAdapter } from './infrastructure/adapters/grpc-core-reports.adapter';
import { GrpcCoreStatisticsAdapter } from './infrastructure/adapters/grpc-core-statistics.adapter';
import { ClientsModule } from '@nestjs/microservices';
import { buildGrpcConfig } from '@app/shared/infrastructure/grpc/grpc-config.builder';
import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';

@Module({
  imports: [
    ClientsModule.register([
      buildGrpcConfig(GrpcPackages.Statistics),
      buildGrpcConfig(GrpcPackages.Reports),
    ]),
  ],
  providers: [
    GrpcCoreStatisticsAdapter,
    {
      provide: CoreStatisticsPort,
      useExisting: GrpcCoreStatisticsAdapter,
    },
    StatisticsService,
    {
      provide: StatisticsPort,
      useExisting: StatisticsService,
    },
    GrpcCoreReportsAdapter,
    {
      provide: CoreReportsPort,
      useExisting: GrpcCoreReportsAdapter,
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
