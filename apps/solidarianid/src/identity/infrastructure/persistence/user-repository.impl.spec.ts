import { UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { EntityManager } from 'typeorm';
import { User } from '../../domain/aggregates/user.aggregate';
import { CountryCheckerPort } from '../../domain/ports/country-checker.port';
import { UserNotFoundError } from '../../domain/repositories/user.repository';
import { CountryCheckerAdapter } from '../adapters/country-checker.adapter';
import { UserDbEntity } from './entities/user.db-entity';
import { UserRepositoryImpl } from './user.repository.impl';

describe('UserRepositoryImpl', () => {
  const DEFAULT_NAME = 'User Name';
  const DEFAULT_EMAIL = 'user@example.com';
  const DEFAULT_PHONE = '12345678';
  const DEFAULT_PASSWORD_HASH = 'hashed_password';
  const DEFAULT_CITY = 'user city';
  const DEFAULT_COUNTRY = 'us';

  let em: MockProxy<EntityManager>;
  let repo: UserRepositoryImpl;
  let countryChecker: CountryCheckerPort;

  const makeDbEntity = (overrides?: Partial<UserDbEntity>): UserDbEntity => {
    const db = new UserDbEntity();
    db.id = overrides?.id ?? UniqueEntityID.create().toString();
    db.name = overrides?.name ?? DEFAULT_NAME;
    db.email = overrides?.email ?? DEFAULT_EMAIL;
    db.phone = overrides?.phone ?? DEFAULT_PHONE;
    db.passwordHash = overrides?.passwordHash ?? DEFAULT_PASSWORD_HASH;
    db.city = overrides?.city ?? DEFAULT_CITY;
    db.country = overrides?.country ?? DEFAULT_COUNTRY;
    return db;
  };

  beforeEach(async () => {
    em = mock<EntityManager>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: EntityManager, useValue: em },
        { provide: CountryCheckerPort, useClass: CountryCheckerAdapter },
        UserRepositoryImpl,
      ],
    }).compile();

    repo = module.get(UserRepositoryImpl);
    countryChecker = module.get(CountryCheckerPort);
  });

  // Basic path tests

  // 1. S1-S2-S3-S4-S5-S6-S7-S8-S9-FIN
  it('should save a user into the database', async () => {
    const userOrError = User.create(
      {
        name: DEFAULT_NAME,
        email: DEFAULT_EMAIL,
        phone: DEFAULT_PHONE,
        passwordHash: DEFAULT_PASSWORD_HASH,
        city: DEFAULT_CITY,
        country: DEFAULT_COUNTRY,
      },
      countryChecker,
    );
    expect(userOrError.isRight()).toBe(true);
    if (userOrError.isLeft()) return;
    const user = userOrError.value;

    await repo.save(user);

    expect(em.save).toHaveBeenCalledTimes(1);
    const [entityClass, entityInstance] = em.save.mock.calls[0];
    expect(entityClass).toBe(UserDbEntity);
    expect(entityInstance).toMatchObject({
      id: user.id.toString(),
      name: DEFAULT_NAME,
      email: DEFAULT_EMAIL,
      phone: DEFAULT_PHONE,
      passwordHash: DEFAULT_PASSWORD_HASH,
      city: DEFAULT_CITY,
      country: DEFAULT_COUNTRY,
    });
  });

  // 2. S1-C1-S2-FIN
  it('findById should return left(UserNotFoundError) when not found', async () => {
    em.findOne.mockResolvedValue(null);

    const id = UniqueEntityID.create();
    const result = await repo.findById(id);

    expect(result.isLeft()).toBe(true);
    if (result.isRight()) return;

    expect(result.value).toBeInstanceOf(UserNotFoundError);
    expect(result.value.idOrEmail).toBe(id.toString());
  });

  // 3. S1-C1-S3-FIN
  it('findById should return User when found', async () => {
    const dbEntity = makeDbEntity();
    em.findOne.mockResolvedValue(dbEntity);

    const id = UniqueEntityID.create(dbEntity.id);

    const result = await repo.findById(id);
    expect(result.isRight()).toBe(true);
    if (result.isLeft()) return;

    const user = result.value;
    expect(user.id.toString()).toBe(dbEntity.id);
    expect(user.name).toBe(dbEntity.name);
    expect(user.email).toBe(dbEntity.email);
    expect(user.phone).toBe(dbEntity.phone);
    expect(user.passwordHash).toBe(dbEntity.passwordHash);
    expect(user.city).toBe(dbEntity.city);
    expect(user.country).toBe(dbEntity.country);

    expect(em.findOne).toHaveBeenCalledWith(UserDbEntity, {
      where: { id: id.toString() },
    });
  });

  // 4. S1-C1-S2-FIN
  it('findByEmail should return left(UserNotFoundError) when not found', async () => {
    em.findOne.mockResolvedValue(null);

    const result = await repo.findByEmail('missing@example.com');

    expect(result.isLeft()).toBe(true);
    if (result.isRight()) return;

    expect(result.value).toBeInstanceOf(UserNotFoundError);
    expect(result.value.idOrEmail).toBe('missing@example.com');
  });

  // 5. S1-C1-S3-FIN
  // This test also covers the mapUserToDomain private method
  it('findByEmail should return User when found', async () => {
    const dbEntity = makeDbEntity();
    em.findOne.mockResolvedValue(dbEntity);

    const result = await repo.findByEmail(dbEntity.email);

    expect(result.isRight()).toBe(true);
    if (result.isLeft()) return;

    const user = result.value;
    expect(user.id.toString()).toBe(dbEntity.id);
    expect(user.email).toBe(dbEntity.email);
    expect(em.findOne).toHaveBeenCalledWith(UserDbEntity, {
      where: { email: dbEntity.email },
    });
  });

  // 6. S1-S2-FIN
  it('findAll should return all users mapped to domain', async () => {
    const dbEntities = [makeDbEntity(), makeDbEntity()];
    em.find.mockResolvedValue(dbEntities);

    const result = await repo.findAll();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0].id.toString()).toBe(dbEntities[0].id);
    expect(result[1].id.toString()).toBe(dbEntities[1].id);
    expect(result[0].email).toBe(dbEntities[0].email);
    expect(result[1].email).toBe(dbEntities[1].email);
    expect(em.find).toHaveBeenCalledWith(UserDbEntity);
  });

  // 7. S1-S2-FIN
  it('remove should return left(UserNotFoundError) when no rows affected', async () => {
    em.delete.mockResolvedValue({
      affected: 0,
      raw: undefined,
    });

    const id = UniqueEntityID.create();
    const result = await repo.remove(id);

    expect(result.isLeft()).toBe(true);
    if (result.isRight()) return;

    expect(result.value).toBeInstanceOf(UserNotFoundError);
    expect(result.value.idOrEmail).toBe(id.toString());
  });

  // 8. S1-C1-S3-FIN
  it('remove should return right(undefined) when delete affected rows', async () => {
    em.delete.mockResolvedValue({
      affected: 1,
      raw: undefined,
    });

    const id = UniqueEntityID.create();
    const result = await repo.remove(id);

    expect(result.isRight()).toBe(true);
    if (result.isLeft()) return;

    expect(result.value).toBeUndefined();
    expect(em.delete).toHaveBeenCalledWith(UserDbEntity, {
      id: id.toString(),
    });
  });
});
