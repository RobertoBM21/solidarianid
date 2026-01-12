import { UniqueEntityID } from '@app/shared/domain';
import { PasswordHasherAdapter } from '@app/shared/infrastructure/adapters/password-hasher.adapter';
import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { EntityManager } from 'typeorm';
import { AdminUser } from '../../domain/aggregates/admin-user.aggregate';
import { AdminUserNotFoundError } from '../../domain/repositories/admin-user.repository';
import { AdminUserRepositoryImpl } from './admin-user.repository.impl';
import { AdminUserDbEntity } from './entities/admin-user.db-entity';

describe('AdminUserRepositoryImpl', () => {
  const DEFAULT_NAME = 'User Name';
  const DEFAULT_EMAIL = 'user@example.com';
  const DEFAULT_PHONE = '12345678';
  const DEFAULT_PASSWORD = 'password';
  const DEFAULT_PASSWORD_HASH = 'hashed_password';

  let repository: AdminUserRepositoryImpl;
  let em: MockProxy<EntityManager>;
  const passwordHasher = new PasswordHasherAdapter();

  const makeDbEntity = (
    overrides?: Partial<AdminUserDbEntity>,
  ): AdminUserDbEntity => {
    const db = new AdminUserDbEntity();
    db.id = overrides?.id ?? UniqueEntityID.create().toString();
    db.name = overrides?.name ?? DEFAULT_NAME;
    db.email = overrides?.email ?? DEFAULT_EMAIL;
    db.phone = overrides?.phone ?? DEFAULT_PHONE;
    db.passwordHash = overrides?.passwordHash ?? DEFAULT_PASSWORD_HASH;
    return db;
  };

  beforeEach(async () => {
    em = mock<EntityManager>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: EntityManager, useValue: em },
        AdminUserRepositoryImpl,
      ],
    }).compile();

    repository = module.get(AdminUserRepositoryImpl);
  });

  // Tests would go here

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should save an admin user', async () => {
    const userOrError = await AdminUser.create(
      {
        name: DEFAULT_NAME,
        email: DEFAULT_EMAIL,
        phone: DEFAULT_PHONE,
        password: DEFAULT_PASSWORD,
      },
      passwordHasher,
    );
    expect(userOrError.isRight()).toBe(true);
    if (userOrError.isLeft()) return;
    const user = userOrError.value;

    await repository.save(user);

    expect(em.save).toHaveBeenCalledTimes(1);
    const [entityClass, entityInstance] = em.save.mock.calls[0];
    expect(entityClass).toBe(AdminUserDbEntity);
    expect(entityInstance).toMatchObject({
      id: user.id.toString(),
      name: DEFAULT_NAME,
      email: DEFAULT_EMAIL,
      phone: DEFAULT_PHONE,
    });
  });

  it('should find an admin user by id', async () => {
    const dbEntity = makeDbEntity();
    em.findOne.mockResolvedValue(dbEntity);

    const result = await repository.findById(
      UniqueEntityID.create(dbEntity.id),
    );

    expect(em.findOne).toHaveBeenCalledWith(AdminUserDbEntity, {
      where: { id: dbEntity.id },
    });
    expect(result.isRight()).toBe(true);
    if (result.isLeft()) return;
    const user = result.value;
    expect(user.id.toString()).toBe(dbEntity.id);
    expect(user.name).toBe(dbEntity.name);
    expect(user.email).toBe(dbEntity.email);
    expect(user.phone).toBe(dbEntity.phone);
    expect(user.passwordHash).toBe(dbEntity.passwordHash);
  });

  it('should return error when admin user not found by id', async () => {
    em.findOne.mockResolvedValue(null);

    const id = UniqueEntityID.create();
    const result = await repository.findById(id);

    expect(result.isLeft()).toBe(true);
    if (result.isRight()) return;

    expect(result.value).toBeInstanceOf(AdminUserNotFoundError);
  });

  it('should find an admin user by email', async () => {
    const dbEntity = makeDbEntity();
    em.findOne.mockResolvedValue(dbEntity);

    const result = await repository.findByEmail(dbEntity.email);

    expect(em.findOne).toHaveBeenCalledWith(AdminUserDbEntity, {
      where: { email: dbEntity.email },
    });
    expect(result.isRight()).toBe(true);
    if (result.isLeft()) return;
    const user = result.value;
    expect(user.id.toString()).toBe(dbEntity.id);
    expect(user.name).toBe(dbEntity.name);
    expect(user.email).toBe(dbEntity.email);
    expect(user.phone).toBe(dbEntity.phone);
    expect(user.passwordHash).toBe(dbEntity.passwordHash);
  });

  it('should return error when admin user not found by email', async () => {
    em.findOne.mockResolvedValue(null);

    const result = await repository.findByEmail('non-existent-email');

    expect(result.isLeft()).toBe(true);
    if (result.isRight()) return;
    expect(result.value).toBeInstanceOf(AdminUserNotFoundError);
  });

  it('should remove an admin user by id', async () => {
    em.delete.mockResolvedValue({
      affected: 1,
      raw: undefined,
    });

    const id = UniqueEntityID.create();
    const result = await repository.remove(id);

    expect(em.delete).toHaveBeenCalledWith(AdminUserDbEntity, {
      id: id.toString(),
    });
    expect(result.isRight()).toBe(true);
  });

  it('should return error when removing non-existent admin user by id', async () => {
    em.delete.mockResolvedValue({
      affected: 0,
      raw: undefined,
    });

    const id = UniqueEntityID.create();
    const result = await repository.remove(id);

    expect(em.delete).toHaveBeenCalledWith(AdminUserDbEntity, {
      id: id.toString(),
    });
    expect(result.isLeft()).toBe(true);
    if (result.isRight()) return;
    expect(result.value).toBeInstanceOf(AdminUserNotFoundError);
  });
});
