import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AdminUser } from '../../domain/aggregates/admin-user.aggregate';
import {
  AdminUserNotFoundError,
  AdminUserRepository,
} from '../../domain/repositories/admin-user.repository';
import { AdminUserDbEntity } from './entities/admin-user.db-entity';

@Injectable()
export class AdminUserRepositoryImpl extends AdminUserRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  async save(adminUser: AdminUser): Promise<void> {
    const dbEntity = new AdminUserDbEntity();
    dbEntity.id = adminUser.id.toString();
    dbEntity.name = adminUser.name;
    dbEntity.email = adminUser.email;
    dbEntity.phone = adminUser.phone;
    dbEntity.passwordHash = adminUser.passwordHash;

    await this.em.save(AdminUserDbEntity, dbEntity);
  }

  async findById(
    id: UniqueEntityID,
  ): Promise<Either<AdminUserNotFoundError, AdminUser>> {
    const dbEntity = await this.em.findOne(AdminUserDbEntity, {
      where: { id: id.toString() },
    });
    if (!dbEntity) {
      return left(new AdminUserNotFoundError(id.toString()));
    }
    return right(this.mapAdminUserToDomain(dbEntity));
  }

  async findByEmail(
    email: string,
  ): Promise<Either<AdminUserNotFoundError, AdminUser>> {
    const dbEntity = await this.em.findOne(AdminUserDbEntity, {
      where: { email },
    });
    if (!dbEntity) {
      return left(new AdminUserNotFoundError(email));
    }
    return right(this.mapAdminUserToDomain(dbEntity));
  }

  async remove(
    id: UniqueEntityID,
  ): Promise<Either<AdminUserNotFoundError, void>> {
    const result = await this.em.delete(AdminUserDbEntity, {
      id: id.toString(),
    });
    if (result.affected === 0) {
      return left(new AdminUserNotFoundError(id.toString()));
    }
    return right(undefined);
  }

  private mapAdminUserToDomain(dbEntity: AdminUserDbEntity): AdminUser {
    const adminUserOrError = AdminUser.createWithHashed(
      {
        name: dbEntity.name,
        email: dbEntity.email,
        phone: dbEntity.phone,
        hashedPassword: dbEntity.passwordHash,
      },
      UniqueEntityID.create(dbEntity.id),
    );

    if (adminUserOrError.isLeft()) {
      throw new Error(
        `Error mapping AdminUserDbEntity to AdminUser aggregate: ${adminUserOrError.value.message}`,
      );
    }

    return adminUserOrError.value;
  }
}
