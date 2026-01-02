import { CommonInfrastructureModule } from '@app/shared/infrastructure';
import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunitiesRepository } from '../domain/repositories/communities.repository';
import cacheConfig from './config/cache.config';
import { CommunitiesRepositoryImpl } from './persistence/communities.repository.impl';
import entities from './persistence/entities';

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
    {
      provide: CommunitiesRepository,
      useClass: CommunitiesRepositoryImpl,
    },
  ],
  exports: [CommonInfrastructureModule, CacheModule, CommunitiesRepository],
})
export class InfrastructureModule {}
