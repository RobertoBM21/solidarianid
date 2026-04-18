import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipRequestAcceptedHandler } from './application/handlers/membership-request-accepted.handler';
import { CommunitiesPort } from './application/ports/communities.port';
import { CommunityMembersPort } from './application/ports/community-members.port';
import { CommunityStatisticsPort } from './application/ports/community-statistics.port';
import { MembershipRequestsPort } from './application/ports/membership-requests.port';
import { CommunitiesIntegrationService } from './application/services/communities-integration.service';
import { CommunitiesService } from './application/services/communities.service';
import { CommunityMembersService } from './application/services/community-members.service';
import { MembershipRequestsService } from './application/services/membership-requests.service';
import { CommunityMemberRepository } from './domain/repositories/community-member.repository';
import { CommunityRepository } from './domain/repositories/community.repository';
import { MembershipRequestRepository } from './domain/repositories/membership-request.repository';
import { CommunityFactory } from './domain/services/community-factory.service';
import { CommunityProposalAcceptedConsumer } from './infrastructure/consumers/community-proposal-accepted.consumer';
import { CommunitiesGrpcController } from './infrastructure/grpc/communities-grpc.controller';
import { CommunityStatisticsAdapter } from './infrastructure/persistence/community-statistics.adapter';
import { CauseDbEntity } from './infrastructure/persistence/entities/cause.db-entity';
import { CommunityMemberDbEntity } from './infrastructure/persistence/entities/community-member.db-entity';
import { CommunityDbEntity } from './infrastructure/persistence/entities/community.db-entity';
import { MembershipRequestDbEntity } from './infrastructure/persistence/entities/membership-request.db-entity';
import { CommunityMemberRepositoryImpl } from './infrastructure/persistence/repositories/community-member.repository.impl';
import { CommunityRepositoryImpl } from './infrastructure/persistence/repositories/community.repository.impl';
import { MembershipRequestRepositoryImpl } from './infrastructure/persistence/repositories/membership-request.repository.impl';
import { CommunitiesController } from './infrastructure/presentation/controllers/communities.controller';
import { CommunityCausesController } from './infrastructure/presentation/controllers/community-causes.controller';
import { CommunityMembersController } from './infrastructure/presentation/controllers/community-members.controller';
import { MembershipRequestsController } from './infrastructure/presentation/controllers/membership-requests.controller';
import { CommunitiesResolver } from './infrastructure/presentation/graphql/communities.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommunityDbEntity,
      CauseDbEntity,
      CommunityMemberDbEntity,
      MembershipRequestDbEntity,
    ]),
  ],
  providers: [
    CommunityRepositoryImpl,
    {
      provide: CommunityRepository,
      useExisting: CommunityRepositoryImpl,
    },
    MembershipRequestRepositoryImpl,
    {
      provide: MembershipRequestRepository,
      useExisting: MembershipRequestRepositoryImpl,
    },
    CommunityMemberRepositoryImpl,
    {
      provide: CommunityMemberRepository,
      useExisting: CommunityMemberRepositoryImpl,
    },

    {
      provide: CommunityFactory,
      inject: [CommunityRepository],
      useFactory: (communityRepository: CommunityRepository) => {
        return new CommunityFactory(communityRepository);
      },
    },

    CommunityStatisticsAdapter,
    {
      provide: CommunityStatisticsPort,
      useExisting: CommunityStatisticsAdapter,
    },

    MembershipRequestAcceptedHandler,

    CommunitiesService,
    {
      provide: CommunitiesPort,
      useExisting: CommunitiesService,
    },
    MembershipRequestsService,
    {
      provide: MembershipRequestsPort,
      useExisting: MembershipRequestsService,
    },
    CommunityMembersService,
    {
      provide: CommunityMembersPort,
      useExisting: CommunityMembersService,
    },

    CommunitiesIntegrationService,

    CommunitiesResolver,
  ],
  exports: [CommunitiesIntegrationService],
  controllers: [
    CommunitiesController,
    CommunityCausesController,
    CommunitiesGrpcController,
    CommunityProposalAcceptedConsumer,
    MembershipRequestsController,
    CommunityMembersController,
  ],
})
export class CommunitiesModule {}
