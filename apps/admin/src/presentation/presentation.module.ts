import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { AdminController } from './controllers/admin.controller';
import { CommunityProposalsController } from './controllers/community-proposals.controller';
import { ReportsController } from './controllers/reports.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [
    AdminController,
    CommunityProposalsController,
    ReportsController,
  ],
})
export class PresentationModule {}
