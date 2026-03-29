import { QueryHandler } from '@nestjs/cqrs';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { GetCommunityExistsQuery } from '../queries/get-community-exists.query';

@QueryHandler(GetCommunityExistsQuery)
export class GetCommunityExistsHandler {
  constructor(private readonly repository: CommunityRepository) {}

  execute(query: GetCommunityExistsQuery): Promise<boolean> {
    return this.repository.exists(query.communityId);
  }
}
