import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPort } from './application/ports/user.port';
import { IdentityIntegrationService } from './application/services/identity-integration.service';
import { UserService } from './application/user.service';
import { CountryCheckerPort } from './domain/ports/country-checker.port';
import { UserRepository } from './domain/repositories/user.repository';
import { CountryCheckerAdapter } from './infrastructure/adapters/country-checker.adapter';
import { UsersGrpcController } from './infrastructure/grpc/users-grpc.controller';
import { AuthMiddleware } from './infrastructure/middlewares/auth.middleware';
import { UserDbEntity } from './infrastructure/persistence/entities/user.db-entity';
import { UserRepositoryImpl } from './infrastructure/persistence/user.repository.impl';
import { CoreAuthController } from './infrastructure/presentation/controllers/auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserDbEntity])],
  providers: [
    CountryCheckerAdapter,
    {
      provide: CountryCheckerPort,
      useExisting: CountryCheckerAdapter,
    },
    UserRepositoryImpl,
    {
      provide: UserRepository,
      useExisting: UserRepositoryImpl,
    },
    IdentityIntegrationService,
    UserService,
    {
      provide: UserPort,
      useExisting: UserService,
    },
  ],
  controllers: [CoreAuthController, UsersGrpcController],
  exports: [IdentityIntegrationService],
})
export class IdentityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
