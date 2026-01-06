import { CommonInfrastructureModule } from '@app/shared/infrastructure';
import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import { CommunitiesModule } from './communities/communities.module';
import { IdentityModule } from './identity/identity.module';
import cacheConfig from './infrastructure/config/cache.config';
import { InitiativesModule } from './initiatives/initiatives.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule.forFeature(cacheConfig)],
      inject: [cacheConfig.KEY],
      useFactory: (conf: ConfigType<typeof cacheConfig>) => ({
        stores: [new KeyvRedis(conf.url)],
      }),
    }),

    CommonInfrastructureModule,

    CommunitiesModule,
    IdentityModule,
    InitiativesModule,
  ],
  controllers: [],
})
export class AppModule {}
