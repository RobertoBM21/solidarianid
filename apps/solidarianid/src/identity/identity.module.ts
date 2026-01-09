import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetUserExistsHandler } from './application/handlers/get-user-exists.handler';
import { UserService } from './application/user.service';
import { CountryCheckerPort } from './domain/ports/country-checker.port';
import { UserPort } from './domain/ports/user.port';
import { UserRepository } from './domain/repositories/user.repository';
import { CountryCheckerAdapter } from './infrastructure/adapters/country-checker.adapter';
import { UserDbEntity } from './infrastructure/persistence/entities/user.db-entity';
import { UserRepositoryImpl } from './infrastructure/persistence/user.repository.impl';
import { UsersController } from './infrastructure/presentation/controllers/users.controller';

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
    GetUserExistsHandler,
    UserService,
    {
      provide: UserPort,
      useExisting: UserService,
    },
  ],
  controllers: [UsersController],
})
export class IdentityModule {}
