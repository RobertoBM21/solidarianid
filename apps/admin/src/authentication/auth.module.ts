import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserRepository } from './domain/repositories/admin-user.repository';
import { AdminUserRepositoryImpl } from './infrastructure/persistence/admin-user.repository.impl';
import { AdminUserDbEntity } from './infrastructure/persistence/entities/admin-user.db-entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminUserDbEntity])],
  providers: [
    AdminUserRepositoryImpl,
    {
      provide: AdminUserRepository,
      useExisting: AdminUserRepositoryImpl,
    },
  ],
})
export class AuthModule {}
