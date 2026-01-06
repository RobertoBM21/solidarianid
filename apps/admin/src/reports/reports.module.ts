import { Module } from '@nestjs/common';
import { ReportsController } from './infrastructure/presentation/controllers/reports.controller';

@Module({
  controllers: [ReportsController],
})
export class ReportsModule {}
