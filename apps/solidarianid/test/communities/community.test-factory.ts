import { DataSource, Repository } from 'typeorm';
import { CommunityDbEntity } from '../../src/communities/infrastructure/persistence/entities/community.db-entity';
import { CommunityMemberTestFactory } from './community-member.test-factory';

export class CommunityTestFactory {
  private repository: Repository<CommunityDbEntity>;
  private membersFactory: CommunityMemberTestFactory;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(CommunityDbEntity);
    this.membersFactory = new CommunityMemberTestFactory(dataSource);
  }

  async create(
    overrides: Partial<CommunityDbEntity> = {},
  ): Promise<CommunityDbEntity> {
    const community = this.repository.create({
      id: overrides.id ?? crypto.randomUUID(),
      name: overrides.name ?? 'Test Community',
      description: overrides.description ?? 'A community for testing purposes',
      createdAt: overrides.createdAt ?? new Date(),
    });
    await this.repository.save(community);
    await this.membersFactory.create(community);
    return community;
  }
}
