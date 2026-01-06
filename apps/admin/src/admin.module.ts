import { CommonInfrastructureModule } from '@app/shared/infrastructure';
import { Inject, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import session from 'express-session';
import { AuthModule } from './authentication/auth.module';
import { ModerationModule } from './moderation/moderation.module';
import webConfig from './presentation/config/web.config';
import { AdminController } from './presentation/controllers/admin.controller';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forFeature(webConfig),

    CommonInfrastructureModule,

    AuthModule,
    ModerationModule,
    ReportsModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {
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
