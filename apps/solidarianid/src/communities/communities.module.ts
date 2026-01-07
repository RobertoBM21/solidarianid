import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetCommunityExistsHandler } from './application/handlers/get-community-exists.handler';
import { CommunitiesService } from './application/services/communities.service';
import { CommunitiesPort } from './domain/ports/community.port';
import { CommunityRepository } from './domain/repositories/community.repository';
import { CommunityFactory } from './domain/services/community-factory.service';
import { CommunityMemberDbEntity } from './infrastructure/persistence/entities/community-member.db-entity';
import { CommunityDbEntity } from './infrastructure/persistence/entities/community.db-entity';
import { CommunityRepositoryImpl } from './infrastructure/persistence/repositories/community.repository.impl';
import { CommunitiesController } from './infrastructure/presentation/controllers/communities.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommunityDbEntity, CommunityMemberDbEntity]),
  ],
  providers: [
    CommunityRepositoryImpl,
    {
      provide: CommunityRepository,
      useExisting: CommunityRepositoryImpl,
    },

    {
      provide: CommunityFactory,
      inject: [CommunityRepository],
      useFactory: (communityRepository: CommunityRepository) => {
        return new CommunityFactory(communityRepository);
      },
    },

    GetCommunityExistsHandler,

    CommunitiesService,
    {
      provide: CommunitiesPort,
      useExisting: CommunitiesService,
    },
  ],
  controllers: [CommunitiesController],
})
export class CommunitiesModule {}
