import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { MembershipRequestAcceptedHandler } from './application/handlers/membership-request-accepted.handler';
import { CommunitiesPort } from './application/ports/communities.port';
import { CommunityMembersPort } from './application/ports/community-members.port';
import { CommunityStatisticsPort } from './application/ports/community-statistics.port';
import { CreateCommunityPort } from './application/ports/create-community.port';
import { HandleCommunityProposalAcceptedPort } from './application/ports/handle-community-proposal-accepted.port';
import { MembershipNotificationsPort } from './application/ports/membership-notifications.port';
import { MembershipRequestsPort } from './application/ports/membership-requests.port';
import { UserProposalsPort } from './application/ports/user-proposals.port';
import { CommunitiesService } from './application/services/communities.service';
import { CommunityMembersService } from './application/services/community-members.service';
import { CreateCommunityService } from './application/services/create-community.service';
import { HandleCommunityProposalAcceptedService } from './application/services/handle-community-proposal-accepted.service';
import { MembershipRequestsService } from './application/services/membership-requests.service';
import { CommunityMemberRepository } from './domain/repositories/community-member.repository';
import { CommunityProposalRepository } from './domain/repositories/community-proposal.repository';
import { CommunityRepository } from './domain/repositories/community.repository';
import { MembershipRequestRepository } from './domain/repositories/membership-request.repository';
import { MembershipNotificationsAdapter } from './infrastructure/adapters/membership-notifications.adapter';
import { CommunitiesIntegrationService } from './infrastructure/communities-integration.service';
import { CommunityProposalAcceptedConsumer } from './infrastructure/consumers/community-proposal-accepted.consumer';
import { CommunityProposalRejectedConsumer } from './infrastructure/consumers/community-proposal-rejected.consumer';
import { CommunitiesGrpcController } from './infrastructure/grpc/communities-grpc.controller';
import { CommunityStatisticsAdapter } from './infrastructure/persistence/community-statistics.adapter';
import { CauseDbEntity } from './infrastructure/persistence/entities/cause.db-entity';
import { CommunityMemberDbEntity } from './infrastructure/persistence/entities/community-member.db-entity';
import { CommunityProposalDbEntity } from './infrastructure/persistence/entities/community-proposal.db-entity';
import { CommunityDbEntity } from './infrastructure/persistence/entities/community.db-entity';
import { MembershipRequestDbEntity } from './infrastructure/persistence/entities/membership-request.db-entity';
import { CommunityMemberRepositoryImpl } from './infrastructure/persistence/repositories/community-member.repository.impl';
import { CommunityProposalRepositoryImpl } from './infrastructure/persistence/repositories/community-proposal.repository.impl';
import { CommunityRepositoryImpl } from './infrastructure/persistence/repositories/community.repository.impl';
import { MembershipRequestRepositoryImpl } from './infrastructure/persistence/repositories/membership-request.repository.impl';
import { UserProposalsAdapter } from './infrastructure/persistence/user-proposals.adapter';
import { CommunitiesController } from './infrastructure/presentation/controllers/communities.controller';
import { CommunityCausesController } from './infrastructure/presentation/controllers/community-causes.controller';
import { CommunityMembersController } from './infrastructure/presentation/controllers/community-members.controller';
import { MembershipRequestsController } from './infrastructure/presentation/controllers/membership-requests.controller';
import { UserProposalsController } from './infrastructure/presentation/controllers/user-proposals.controller';
import { CommunitiesResolver } from './infrastructure/presentation/graphql/communities.resolver';

@Module({
  imports: [
    NotificationsModule,
    TypeOrmModule.forFeature([
      CommunityDbEntity,
      CauseDbEntity,
      CommunityMemberDbEntity,
      MembershipRequestDbEntity,
      CommunityProposalDbEntity,
    ]),
  ],
  providers: [
    // Persistence
    {
      provide: CommunityRepository,
      useClass: CommunityRepositoryImpl,
    },
    {
      provide: MembershipRequestRepository,
      useClass: MembershipRequestRepositoryImpl,
    },
    {
      provide: CommunityMemberRepository,
      useClass: CommunityMemberRepositoryImpl,
    },
    {
      provide: CommunityProposalRepository,
      useClass: CommunityProposalRepositoryImpl,
    },

    // Application services
    {
      provide: CreateCommunityPort,
      useClass: CreateCommunityService,
    },
    {
      provide: HandleCommunityProposalAcceptedPort,
      useClass: HandleCommunityProposalAcceptedService,
    },

    // Ports
    {
      provide: CommunityStatisticsPort,
      useClass: CommunityStatisticsAdapter,
    },
    UserProposalsAdapter,
    {
      provide: UserProposalsPort,
      useExisting: UserProposalsAdapter,
    },
    {
      provide: CommunitiesPort,
      useClass: CommunitiesService,
    },
    {
      provide: MembershipRequestsPort,
      useClass: MembershipRequestsService,
    },
    {
      provide: CommunityMembersPort,
      useClass: CommunityMembersService,
    },
    {
      provide: MembershipNotificationsPort,
      useClass: MembershipNotificationsAdapter,
    },

    // Handlers
    MembershipRequestAcceptedHandler,

    CommunitiesIntegrationService,

    CommunitiesResolver,
  ],
  exports: [CommunitiesIntegrationService],
  controllers: [
    CommunitiesController,
    CommunityCausesController,
    CommunitiesGrpcController,
    CommunityProposalAcceptedConsumer,
    CommunityProposalRejectedConsumer,
    MembershipRequestsController,
    CommunityMembersController,
    UserProposalsController,
  ],
})
export class CommunitiesModule {}
