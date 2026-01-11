import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from '../../domain/aggregates/user.aggregate';
import { CountryCheckerPort } from '../../domain/ports/country-checker.port';
import {
  UserNotFoundError,
  UserRepository,
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
    dbEntity.passwordHash = user.passwordHash;
    dbEntity.phone = user.phone;
    dbEntity.city = user.city;
    dbEntity.country = user.country;
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

  async findAll(): Promise<User[]> {
    const dbEntities = await this.em.find(UserDbEntity);
    return dbEntities.map((user) => this.mapUserToDomain(user));
  }

  private mapUserToDomain(entity: UserDbEntity): User {
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
