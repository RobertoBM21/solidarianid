import { DataSource, EntityManager, Repository } from 'typeorm';
import { CommunityMemberDbEntity } from '../../../src/communities/infrastructure/persistence/entities/community-member.db-entity';
import { CommunityDbEntity } from '../../../src/communities/infrastructure/persistence/entities/community.db-entity';

export class CommunityMemberTestFactory {
  private repository: Repository<CommunityMemberDbEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(CommunityMemberDbEntity);
  }

  async create(
    community: CommunityDbEntity,
    userId?: string,
    admin = true,
    manager?: EntityManager,
  ): Promise<CommunityMemberDbEntity> {
    const communityMember = this.repository.create({
      id: crypto.randomUUID(),
      communityId: community.id,
      userId: userId ?? crypto.randomUUID(),
      admin,
      createdAt: new Date(),
    });

    // If there's an ongoing transaction, use it. If not, use the normal repo.
    if (manager) {
      return manager.save(CommunityMemberDbEntity, communityMember);
    }
    return this.repository.save(communityMember);
  }
}
