import { CommonInfrastructureModule } from '@app/shared/infrastructure';
import { Inject, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import session from 'express-session';
import webConfig from './config/web.config';
import entities from './persistence/entities';

@Module({
  imports: [
    ConfigModule.forFeature(webConfig),
    CommonInfrastructureModule,

    TypeOrmModule.forFeature(entities),
  ],
  exports: [CommonInfrastructureModule],
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
