import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunitiesModule } from '../communities/communities.module';
import { GetMembershipsPort } from './application/ports/get-memberships.port';
import { UserPort } from './application/ports/user.port';
import { IdentityIntegrationService } from './application/services/identity-integration.service';
import { UserService } from './application/user.service';
import { CountryCheckerPort } from './domain/ports/country-checker.port';
import { UserRepository } from './domain/repositories/user.repository';
import { CountryCheckerAdapter } from './infrastructure/adapters/country-checker.adapter';
import { GetMembershipsIntegrationAdapter } from './infrastructure/get-memberships-integration.adapter';
import { AuthGrpcController } from './infrastructure/grpc/auth-grpc.controller';
import { UsersGrpcController } from './infrastructure/grpc/users-grpc.controller';
import { AuthMiddleware } from './infrastructure/middlewares/auth.middleware';
import { UserDbEntity } from './infrastructure/persistence/entities/user.db-entity';
import { UserRepositoryImpl } from './infrastructure/persistence/user.repository.impl';
import { ProfileController } from './infrastructure/presentation/controllers/profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserDbEntity]), CommunitiesModule],
  providers: [
    {
      provide: CountryCheckerPort,
      useClass: CountryCheckerAdapter,
    },
    {
      provide: GetMembershipsPort,
      useClass: GetMembershipsIntegrationAdapter,
    },
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: UserPort,
      useClass: UserService,
    },

    IdentityIntegrationService,
  ],
  controllers: [AuthGrpcController, ProfileController, UsersGrpcController],
  exports: [IdentityIntegrationService],
})
export class IdentityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
