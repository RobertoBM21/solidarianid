import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetUserExistsHandler } from './application/handlers/get-user-exists.handler';
import { UserPort } from './application/ports/user.port';
import { UserService } from './application/user.service';
import { CountryCheckerPort } from './domain/ports/country-checker.port';
import { UserRepository } from './domain/repositories/user.repository';
import { CountryCheckerAdapter } from './infrastructure/adapters/country-checker.adapter';
import { AuthMiddleware } from './infrastructure/middlewares/auth.middleware';
import { UserDbEntity } from './infrastructure/persistence/entities/user.db-entity';
import { UserRepositoryImpl } from './infrastructure/persistence/user.repository.impl';
import { UsersEventsController } from './infrastructure/presentation/controllers/users-events.controller';
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
  controllers: [UsersController, UsersEventsController],
})
export class IdentityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
