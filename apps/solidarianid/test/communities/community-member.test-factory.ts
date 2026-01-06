import { DataSource, Repository } from 'typeorm';
import { CommunityMemberDbEntity } from '../../src/communities/infrastructure/persistence/entities/community-member.db-entity';
import { CommunityDbEntity } from '../../src/communities/infrastructure/persistence/entities/community.db-entity';
import { UserDbEntity } from '../../src/identity/infrastructure/persistence/entities/user.db-entity';
import { UserTestFactory } from '../users/user.test-factory';

export class CommunityMemberTestFactory {
  private repository: Repository<CommunityMemberDbEntity>;
  private users: UserTestFactory;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(CommunityMemberDbEntity);
    this.users = new UserTestFactory(dataSource);
  }

  async create(
    community: CommunityDbEntity,
    user?: UserDbEntity,
    admin = true,
  ): Promise<CommunityMemberDbEntity> {
    user ??= await this.users.create();

    const communityMember = this.repository.create({
      id: crypto.randomUUID(),
      communityId: community.id,
      userId: user.id,
      admin,
    });
    return this.repository.save(communityMember);
  }
}
