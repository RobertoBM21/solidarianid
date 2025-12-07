import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { ReportsController } from './controllers/reports.controller';

@Module({
  controllers: [AdminController, ReportsController],
})
export class PresentationModule {}
