import { CommonInfrastructureModule } from '@app/shared/infrastructure';
import { Inject, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import session from 'express-session';
import { AdminUserRepository } from '../domain/repositories/admin-user.repository';
import { CommunityProposalsRepository } from '../domain/repositories/community-proposals.repository';
import webConfig from './config/web.config';
import { AdminUserRepositoryImpl } from './persistence/admin-user.repository.impl';
import { CommunityProposalsRepositoryImpl } from './persistence/community-proposals.repository.impl';
import entities from './persistence/entities';

@Module({
  imports: [
    ConfigModule.forFeature(webConfig),
    CommonInfrastructureModule,

    TypeOrmModule.forFeature(entities),
  ],
  providers: [
    CommunityProposalsRepositoryImpl,
    {
      provide: CommunityProposalsRepository,
      useExisting: CommunityProposalsRepositoryImpl,
    },
    AdminUserRepositoryImpl,
    {
      provide: AdminUserRepository,
      useExisting: AdminUserRepositoryImpl,
    },
  ],
  exports: [
    CommonInfrastructureModule,
    CommunityProposalsRepository,
    AdminUserRepository,
  ],
})
export class InfrastructureModule {
  constructor(
    @Inject(webConfig.KEY)
    private readonly config: ConfigType<typeof webConfig>,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          secret: this.config.sessionSecret,
          resave: false,
          saveUninitialized: false,
        }),
      )
      .forRoutes('*');
  }
}
