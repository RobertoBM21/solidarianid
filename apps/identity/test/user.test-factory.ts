import { DataSource, Repository } from 'typeorm';
import { UserDbEntity } from '../src/identity/infrastructure/persistence/entities/user.db-entity';

export class UserTestFactory {
  private repository: Repository<UserDbEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = dataSource.getRepository(UserDbEntity);
  }

  async create(overrides: Partial<UserDbEntity> = {}): Promise<UserDbEntity> {
    const userData = this.repository.create({
      id: overrides.id ?? crypto.randomUUID(),
      name: overrides.name ?? 'Test User',
      email: overrides.email ?? `test-${crypto.randomUUID()}@example.com`,
      phone: overrides.phone ?? '123456789',
      passwordHash: overrides.passwordHash ?? 'hashed_password',
      city: overrides.city ?? 'Madrid',
      country: overrides.country ?? 'es',
    });
    return this.repository.save(userData);
  }
}
