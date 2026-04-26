import { buildGrpcClientConfig } from '@app/shared/infrastructure/config/grpc.config';
import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { RawStatisticsPort } from './application/ports/raw-statistics.port';
import { StatisticsPort } from './application/ports/statistics.port';
import { UserHistoryPort } from './application/ports/user-history.port';
import { UsersPort } from './application/ports/users.port';
import { StatisticsService } from './application/services/statistics.service';
import { StatisticsGrpcAdapter } from './infrastructure/adapters/statistics-grpc.adapter';
import { UserHistoryGrpcAdapter } from './infrastructure/adapters/user-history-grpc.adapter';
import { UsersGrpcAdapter } from './infrastructure/adapters/users-grpc.adapter';
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
    {
      provide: RawStatisticsPort,
      useClass: StatisticsGrpcAdapter,
    },
    {
      provide: StatisticsPort,
      useClass: StatisticsService,
    },
    {
      provide: UsersPort,
      useClass: UsersGrpcAdapter,
    },
    {
      provide: UserHistoryPort,
      useClass: UserHistoryGrpcAdapter,
    },
  ],
  controllers: [DashboardController, ReportsController],
})
export class ReportsModule {}
