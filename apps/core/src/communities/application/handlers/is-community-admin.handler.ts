import { QueryHandler } from '@nestjs/cqrs';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { IsCommunityAdminQuery } from '../queries/is-community-admin.query';

@QueryHandler(IsCommunityAdminQuery)
export class IsCommunityAdminHandler {
  constructor(private readonly repository: CommunityRepository) {}

  execute(query: IsCommunityAdminQuery): Promise<boolean> {
    return this.repository.isAdmin(query.communityId, query.userId);
  }
}
