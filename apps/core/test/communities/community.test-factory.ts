import { DataSource, Repository } from 'typeorm';
import { CommunityDbEntity } from '../../src/communities/infrastructure/persistence/entities/community.db-entity';
import { CommunityMemberTestFactory } from './memberships/community-member.test-factory';

export class CommunityTestFactory {
  private repository: Repository<CommunityDbEntity>;
  private membersFactory: CommunityMemberTestFactory;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(CommunityDbEntity);
    this.membersFactory = new CommunityMemberTestFactory(dataSource);
  }

  async create(
    overrides: Partial<CommunityDbEntity> = {},
  ): Promise<CommunityDbEntity> {
    const communityData = this.repository.create({
      id: overrides.id ?? crypto.randomUUID(),
      name: overrides.name ?? 'Test Community',
      description: overrides.description ?? 'A community for testing purposes',
      createdAt: overrides.createdAt ?? new Date(),
    });

    return this.dataSource.transaction(async (manager) => {
      const savedCommunity = await manager.save(
        CommunityDbEntity,
        communityData,
      );

      await this.membersFactory.create(
        savedCommunity,
        undefined,
        true,
        manager,
      );

      return savedCommunity;
    });
  }
}
