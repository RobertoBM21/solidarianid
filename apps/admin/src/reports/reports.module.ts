import { buildGrpcClientConfig } from '@app/shared/infrastructure/config/grpc.config';
import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { CoreReportsPort } from './application/ports/core-reports.port';
import { CoreStatisticsPort } from './application/ports/core-statistics.port';
import { StatisticsPort } from './application/ports/statistics.port';
import { UsersPort } from './application/ports/users.port';
import { StatisticsService } from './application/services/statistics.service';
import { UsersService } from './application/services/users.service';
import { GrpcCoreReportsAdapter } from './infrastructure/adapters/grpc-core-reports.adapter';
import { GrpcCoreStatisticsAdapter } from './infrastructure/adapters/grpc-core-statistics.adapter';
import { DashboardController } from './infrastructure/presentation/controllers/dashboard.controller';
import { ReportsController } from './infrastructure/presentation/controllers/reports.controller';

@Module({
  imports: [
    ClientsModule.register([
      buildGrpcClientConfig(GrpcPackages.Statistics),
      buildGrpcClientConfig(GrpcPackages.Reports),
      buildGrpcClientConfig(GrpcPackages.Identity),
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
