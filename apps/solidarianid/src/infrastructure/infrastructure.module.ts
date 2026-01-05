import { CommonInfrastructureModule } from '@app/shared/infrastructure';
import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CausesRepository } from '../domain/repositories/causes.repository';
import { CommunitiesRepository } from '../domain/repositories/communities.repository';
import { UserRepository } from '../domain/repositories/user.repository';
import cacheConfig from './config/cache.config';
import { CausesRepositoryImpl } from './persistence/causes.repository.impl';
import { CommunitiesRepositoryImpl } from './persistence/communities.repository.impl';
import entities from './persistence/entities';
import { UsersRepositoryImpl } from './persistence/users.repository.impl';

@Module({
  imports: [
    CommonInfrastructureModule,

    TypeOrmModule.forFeature(entities),

    CacheModule.registerAsync({
      imports: [ConfigModule.forFeature(cacheConfig)],
      inject: [cacheConfig.KEY],
      useFactory: (conf: ConfigType<typeof cacheConfig>) => ({
        stores: [new KeyvRedis(conf.url)],
      }),
    }),
  ],
  providers: [
    CommunitiesRepositoryImpl,
    CausesRepositoryImpl,
    {
      provide: CommunitiesRepository,
      useClass: CommunitiesRepositoryImpl,
    },
    UsersRepositoryImpl,
    {
      provide: UserRepository,
      useClass: UsersRepositoryImpl,
    },
    {
      provide: CausesRepository,
      useClass: CausesRepositoryImpl,
    },
  ],
  exports: [
    CommonInfrastructureModule,
    CacheModule,
    CommunitiesRepository,
    UserRepository,
    CausesRepository,
  ],
})
export class InfrastructureModule {}
