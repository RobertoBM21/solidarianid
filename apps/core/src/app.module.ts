import { CommonInfrastructureModule } from '@app/shared/infrastructure';
import { AuthMiddleware } from '@app/shared/infrastructure/auth';
import KeyvRedis from '@keyv/redis';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { CommunitiesModule } from './communities/communities.module';
import { FundingModule } from './funding/funding.module';
import cacheConfig from './infrastructure/config/cache.config';
import { InitiativesModule } from './initiatives/initiatives.module';
import { NotificationsModule } from './notifications/notifications.module';
import { VolunteeringModule } from './volunteering/volunteering.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule.forFeature(cacheConfig)],
      inject: [cacheConfig.KEY],
      useFactory: (conf: ConfigType<typeof cacheConfig>) => ({
        stores: [new KeyvRedis(conf.url)],
      }),
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/core/src/schema.gql'),
      playground: true,
      subscriptions: {
        'graphql-ws': true,
      },
    }),

    CommonInfrastructureModule,

    NotificationsModule,
    CommunitiesModule,
    InitiativesModule,
    FundingModule,
    VolunteeringModule,
  ],
  controllers: [],
})
export class CoreAppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
