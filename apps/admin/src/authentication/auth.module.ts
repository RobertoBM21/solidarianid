import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './application/services/auth.service';
import { AuthPort } from './application/ports/auth.port';
import { AdminUserRepository } from './domain/repositories/admin-user.repository';
import { AdminUserRepositoryImpl } from './infrastructure/persistence/admin-user.repository.impl';
import { AdminUserDbEntity } from './infrastructure/persistence/entities/admin-user.db-entity';
import { AuthController } from './infrastructure/presentation/controllers/auth.controller';
import { authMiddleware } from './infrastructure/presentation/middleware/auth.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([AdminUserDbEntity])],
  providers: [
    AdminUserRepositoryImpl,
    {
      provide: AdminUserRepository,
      useExisting: AdminUserRepositoryImpl,
    },
    AuthService,
    {
      provide: AuthPort,
      useExisting: AuthService,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(authMiddleware).forRoutes('*');
  }
}
