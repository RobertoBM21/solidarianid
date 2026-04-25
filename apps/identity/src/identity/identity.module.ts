import { buildGrpcClientConfig } from '@app/shared/infrastructure/config/grpc.config';
import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetMembershipsPort } from './application/ports/get-memberships.port';
import { UserPort } from './application/ports/user.port';
import { UserService } from './application/user.service';
import { CountryCheckerPort } from './domain/ports/country-checker.port';
import { UserRepository } from './domain/repositories/user.repository';
import { CountryCheckerAdapter } from './infrastructure/adapters/country-checker.adapter';
import { GetMembershipsAdapter } from './infrastructure/adapters/get-memberships.adapter';
import { AuthGrpcController } from './infrastructure/grpc/auth-grpc.controller';
import { IdentityGrpcController } from './infrastructure/grpc/identity-grpc.controller';
import { UserDbEntity } from './infrastructure/persistence/entities/user.db-entity';
import { UserRepositoryImpl } from './infrastructure/persistence/user.repository.impl';
import { ProfileController } from './infrastructure/presentation/controllers/profile.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDbEntity]),
    ClientsModule.register([buildGrpcClientConfig(GrpcPackages.Communities)]),
  ],
  providers: [
    {
      provide: CountryCheckerPort,
      useClass: CountryCheckerAdapter,
    },
    {
      provide: GetMembershipsPort,
      useClass: GetMembershipsAdapter,
    },
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: UserPort,
      useClass: UserService,
    },
  ],
  controllers: [AuthGrpcController, ProfileController, IdentityGrpcController],
})
export class IdentityModule {}
