import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from '../../domain/aggregates/user.aggregate';
import { CountryCheckerPort } from '../../domain/ports/country-checker.port';
import {
  UserNotFoundError,
  UserRepository,
  UsersPage,
} from '../../domain/repositories/user.repository';
import { UserDbEntity } from './entities/user.db-entity';

@Injectable()
export class UserRepositoryImpl extends UserRepository {
  constructor(
    private readonly countryChecker: CountryCheckerPort,
    private readonly em: EntityManager,
  ) {
    super();
  }

  async save(user: User): Promise<void> {
    const dbEntity = new UserDbEntity();
    dbEntity.id = user.id.toString();
    dbEntity.name = user.name;
    dbEntity.email = user.email;
    dbEntity.passwordHash = user.passwordHash ?? '';
    dbEntity.phone = user.phone ?? '';
    dbEntity.city = user.city ?? '';
    dbEntity.country = user.country ?? '';
    await this.em.save(UserDbEntity, dbEntity);
  }

  async findById(id: UniqueEntityID): Promise<Either<UserNotFoundError, User>> {
    const dbEntity = await this.em.findOne(UserDbEntity, {
      where: { id: id.toString() },
    });
    if (!dbEntity) {
      return left(new UserNotFoundError(id.toString()));
    }
    return right(this.mapUserToDomain(dbEntity));
  }

  async findByEmail(email: string): Promise<Either<UserNotFoundError, User>> {
    const dbEntity = await this.em.findOne(UserDbEntity, {
      where: { email: email },
    });
    if (!dbEntity) {
      return left(new UserNotFoundError(email));
    }
    return right(this.mapUserToDomain(dbEntity));
  }

  async list(page?: number, search?: string): Promise<UsersPage> {
    const take = 10;
    const skip = page && page > 0 ? (page - 1) * take : 0;

    const queryBuilder = this.em
      .getRepository(UserDbEntity)
      .createQueryBuilder('user');

    if (search) {
      queryBuilder.where('user.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const users = await queryBuilder
      .select('user.id', 'id')
      .addSelect('user.name', 'name')
      .take(take)
      .skip(skip)
      .getRawMany<{ id: string; name: string }>();

    const totalUsers = await queryBuilder.getCount();
    const totalPages = Math.ceil(totalUsers / take);

    return {
      users,
      totalPages,
    };
  }

  private mapUserToDomain(entity: UserDbEntity): User {
    if (!entity.passwordHash && !entity.city && !entity.country) {
      const obj = User.createSocialUser(
        {
          name: entity.name,
          email: entity.email,
        },
        entity.id,
      );
      if (obj.isLeft()) {
        throw new Error(
          `Error mapping UserDbEntity to User aggregate: ${obj.value.message}`,
        );
      }
      return obj.value;
    }

    const obj = User.createWithHashed(
      {
        name: entity.name,
        email: entity.email,
        phone: entity.phone,
        hashedPassword: entity.passwordHash,
        city: entity.city,
        country: entity.country,
      },
      this.countryChecker,
      entity.id,
    );
    if (obj.isLeft()) {
      // This should never happen, as data is coming from the DB
      throw new Error(
        `Error mapping UserDbEntity to User aggregate: ${obj.value.message}`,
      );
    }
    return obj.value;
  }

  async remove(id: UniqueEntityID): Promise<Either<UserNotFoundError, void>> {
    const result = await this.em.delete(UserDbEntity, { id: id.toString() });
    if (result.affected === 0) {
      return left(new UserNotFoundError(id.toString()));
    }
    return right(undefined);
  }
}
