import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityProposalAcceptedHandler } from './application/handlers/community-proposal-accepted.handler';
import { CommunityProposalsService } from './application/services/community-proposals.service';
import { CommunityProposalsPort } from './application/ports/community-proposals.port';
import { CommunityProposalRepository } from './domain/repositories/community-proposal.repository';
import { CommunityProposalDbEntity } from './infrastructure/persistence/entities/community-proposal.db-entity';
import { CommunityProposalRepositoryImpl } from './infrastructure/persistence/repositories/community-proposal.repository.impl';
import { CommunityProposalsController } from './infrastructure/presentation/controllers/community-proposals.controller';
import { ProposalsEventsController } from './infrastructure/presentation/controllers/proposals-events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CommunityProposalDbEntity])],
  providers: [
    CommunityProposalRepositoryImpl,
    {
      provide: CommunityProposalRepository,
      useExisting: CommunityProposalRepositoryImpl,
    },
    CommunityProposalsService,
    {
      provide: CommunityProposalsPort,
      useExisting: CommunityProposalsService,
    },
    CommunityProposalAcceptedHandler,
  ],
  controllers: [CommunityProposalsController, ProposalsEventsController],
})
export class ModerationModule {}
