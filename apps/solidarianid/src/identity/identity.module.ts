import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './application/user.service';
import { UserPort } from './domain/ports/user.port';
import { UserRepository } from './domain/repositories/user.repository';
import { UserDbEntity } from './infrastructure/persistence/entities/user.db-entity';
import { UserRepositoryImpl } from './infrastructure/persistence/user.repository.impl';
import { UsersController } from './infrastructure/presentation/controllers/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserDbEntity])],
  providers: [
    UserRepositoryImpl,
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
    UserService,
    {
      provide: UserPort,
      useExisting: UserService,
    },
  ],
  controllers: [UsersController],
})
export class IdentityModule {}
