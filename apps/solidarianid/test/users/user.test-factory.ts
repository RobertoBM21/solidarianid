import { DataSource, Repository } from 'typeorm';
import { UserDbEntity } from '../../src/identity/infrastructure/persistence/entities/user.db-entity';

export class UserTestFactory {
  private repository: Repository<UserDbEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(UserDbEntity);
  }

  create(overrides: Partial<UserDbEntity> = {}): Promise<UserDbEntity> {
    const id = overrides.id ?? crypto.randomUUID();
    const user = this.repository.create({
      id,
      name: overrides.name ?? 'Test User',
      email: overrides.email ?? `${id}@example.com`,
      phone: overrides.phone ?? '1234567890',
      passwordHash: overrides.passwordHash ?? 'not-relevant-for-test',
      city: overrides.city ?? 'Test City',
      country: overrides.country ?? 'es',
    });
    return this.repository.save(user);
  }
}
