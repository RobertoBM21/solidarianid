import { Module } from '@nestjs/common';
import { CommunityProposalsPort } from '../domain/ports/community-proposals.port';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { CommunityProposalsService } from './services/community-proposals.service';

@Module({
  imports: [InfrastructureModule],
  providers: [
    CommunityProposalsService,
    {
      provide: CommunityProposalsPort,
      useExisting: CommunityProposalsService,
    },
  ],
  exports: [CommunityProposalsPort],
})
export class ApplicationModule {}
