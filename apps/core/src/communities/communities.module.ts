import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetCommunityExistsHandler } from './application/handlers/get-community-exists.handler';
import { GetMembershipsHandler } from './application/handlers/get-memberships.handler';
import { GetMyMembershipsHandler } from './application/handlers/get-my-memberships.handler';
import { MembershipRequestAcceptedHandler } from './application/handlers/membership-request-accepted.handler';
import { CommunitiesPort } from './application/ports/communities.port';
import { CommunityMembersPort } from './application/ports/community-members.port';
import { CommunityStatisticsPort } from './application/ports/community-statistics.port';
import { MembershipRequestsPort } from './application/ports/membership-requests.port';
import { MyMembershipsPort } from './application/ports/my-memberships.port';
import { CommunitiesIntegrationService } from './application/services/communities-integration.service';
import { CommunitiesService } from './application/services/communities.service';
import { CommunityMembersService } from './application/services/community-members.service';
import { MembershipRequestsService } from './application/services/membership-requests.service';
import { CommunityMemberRepository } from './domain/repositories/community-member.repository';
import { CommunityRepository } from './domain/repositories/community.repository';
import { MembershipRequestRepository } from './domain/repositories/membership-request.repository';
import { CommunityFactory } from './domain/services/community-factory.service';
import { CommunityStatisticsAdapter } from './infrastructure/persistence/community-statistics.adapter';
import { CauseDbEntity } from './infrastructure/persistence/entities/cause.db-entity';
import { CommunityMemberDbEntity } from './infrastructure/persistence/entities/community-member.db-entity';
import { CommunityDbEntity } from './infrastructure/persistence/entities/community.db-entity';
import { MembershipRequestDbEntity } from './infrastructure/persistence/entities/membership-request.db-entity';
import { MyMembershipsAdapter } from './infrastructure/persistence/my-memberships.adapter';
import { CommunityMemberRepositoryImpl } from './infrastructure/persistence/repositories/community-member.repository.impl';
import { CommunityRepositoryImpl } from './infrastructure/persistence/repositories/community.repository.impl';
import { MembershipRequestRepositoryImpl } from './infrastructure/persistence/repositories/membership-request.repository.impl';
import { CommunitiesController } from './infrastructure/presentation/controllers/communities.controller';
import { CommunityCausesController } from './infrastructure/presentation/controllers/community-causes.controller';
import { CommunityEventsController } from './infrastructure/presentation/controllers/community-events.controller';
import { CommunityMembersController } from './infrastructure/presentation/controllers/community-members.controller';
import { MembershipRequestsController } from './infrastructure/presentation/controllers/membership-requests.controller';

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
    GetCommunityExistsHandler,

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
    MyMembershipsAdapter,
    {
      provide: MyMembershipsPort,
      useExisting: MyMembershipsAdapter,
    },

    GetCommunityExistsHandler,
    GetMembershipsHandler,
    GetMyMembershipsHandler,
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
  ],
  exports: [CommunitiesIntegrationService],
  controllers: [
    CommunitiesController,
    CommunityCausesController,
    CommunityEventsController,
    MembershipRequestsController,
    CommunityMembersController,
  ],
})
export class CommunitiesModule {}
