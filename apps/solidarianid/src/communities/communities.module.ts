import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetCommunityExistsHandler } from './application/handlers/get-community-exists.handler';
import { IsCommunityAdminHandler } from './application/handlers/is-community-admin.handler';
import { MembershipRequestAcceptedHandler } from './application/handlers/membership-request-accepted.handler';
import { CommunitiesService } from './application/services/communities.service';
import { MembershipRequestsService } from './application/services/membership-requests.service';
import { CommunitiesPort } from './domain/ports/community.port';
import { MembershipRequestsPort } from './domain/ports/membership-requests.port';
import { CommunityMemberRepository } from './domain/repositories/community-member.repository';
import { CommunityRepository } from './domain/repositories/community.repository';
import { MembershipRequestRepository } from './domain/repositories/membership-request.repository';
import { CommunityFactory } from './domain/services/community-factory.service';
import { CommunityMemberDbEntity } from './infrastructure/persistence/entities/community-member.db-entity';
import { CommunityDbEntity } from './infrastructure/persistence/entities/community.db-entity';
import { MembershipRequestDbEntity } from './infrastructure/persistence/entities/membership-request.db-entity';
import { CommunityMemberRepositoryImpl } from './infrastructure/persistence/repositories/community-member.repository.impl';
import { CommunityRepositoryImpl } from './infrastructure/persistence/repositories/community.repository.impl';
import { MembershipRequestRepositoryImpl } from './infrastructure/persistence/repositories/membership-request.repository.impl';
import { CommunitiesController } from './infrastructure/presentation/controllers/communities.controller';
import { MembershipRequestsController } from './infrastructure/presentation/controllers/membership-requests.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommunityDbEntity,
      CommunityMemberDbEntity,
      MembershipRequestDbEntity,
    ]),
  ],
  providers: [
    GetCommunityExistsHandler,
    IsCommunityAdminHandler,

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

    GetCommunityExistsHandler,
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
  ],
  controllers: [CommunitiesController, MembershipRequestsController],
})
export class CommunitiesModule {}
