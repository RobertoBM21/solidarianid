import { CommonInfrastructureModule } from '@app/shared/infrastructure';
import { AuthMiddleware } from '@app/shared/infrastructure/auth';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { IdentityModule } from './identity/identity.module';

@Module({
  imports: [CommonInfrastructureModule, IdentityModule],
})
export class IdentityAppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
