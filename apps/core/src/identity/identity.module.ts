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
import { AuthGrpcController } from './infrastructure/grpc/auth-grpc.controller';
import { GetMembershipsIntegrationAdapter } from './infrastructure/get-memberships-integration.adapter';
import { GetMembershipsPort } from './application/ports/get-memberships.port';
import { CommunitiesModule } from '../communities/communities.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserDbEntity]), CommunitiesModule],
  providers: [
    CountryCheckerAdapter,
    {
      provide: CountryCheckerPort,
      useExisting: CountryCheckerAdapter,
    },
    GetMembershipsIntegrationAdapter,
    {
      provide: GetMembershipsPort,
      useExisting: GetMembershipsIntegrationAdapter,
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
  controllers: [AuthGrpcController, UsersGrpcController],
  exports: [IdentityIntegrationService],
})
export class IdentityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
