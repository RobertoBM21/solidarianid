import { QueryHandler } from '@nestjs/cqrs';
import { CommunityMemberRepository } from '../../domain/repositories/community-member.repository';
import {
  GetMembershipsQuery,
  GetMembershipsQueryResult,
} from '../queries/get-memberships.query';

@QueryHandler(GetMembershipsQuery)
export class GetMembershipsHandler {
  constructor(private readonly repository: CommunityMemberRepository) {}

  async execute(
    query: GetMembershipsQuery,
  ): Promise<GetMembershipsQueryResult> {
    const communityNamesPerUser = await this.repository.listByUserIds(
      query.userIds,
    );
    return { communityNamesPerUser };
  }
}
