import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityProposalsService } from './application/services/community-proposals.service';
import { CommunityProposalsPort } from './domain/ports/community-proposals.port';
import { CommunityProposalRepository } from './domain/repositories/community-proposal.repository';
import { CommunityProposalDbEntity } from './infrastructure/persistence/entities/community-proposal.db-entity';
import { CommunityProposalRepositoryImpl } from './infrastructure/persistence/repositories/community-proposal.repository.impl';
import { CommunityProposalsController } from './infrastructure/presentation/controllers/community-proposals.controller';

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
  ],
  controllers: [CommunityProposalsController],
})
export class ModerationModule {}
