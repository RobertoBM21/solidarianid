import { UserMembershipHistoryItem } from '@app/shared/application/dtos/my-collaborations.dto';
import { UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { Cause } from '../../domain/entities/cause.entity';
import { CommunityMemberRepository } from '../../domain/repositories/community-member.repository';
import { CommunityRepository } from '../../domain/repositories/community.repository';

type CauseData = Pick<
  Cause,
  'title' | 'description' | 'duration' | 'ods' | 'closed' | 'createdAt'
> & {
  communityName: string;
};

@Injectable()
export class CommunitiesIntegrationService {
  constructor(
    private readonly communityRepo: CommunityRepository,
    private readonly communityMemberRepo: CommunityMemberRepository,
  ) {}

  async isCommunityAdmin(
    userId: string,
    communityId: string,
  ): Promise<boolean> {
    const communityIdObj = UniqueEntityID.create(communityId);
    const communityOrError = await this.communityRepo.findById(communityIdObj);
    if (communityOrError.isLeft()) {
      return false;
    }
    const community = communityOrError.value;
    return community.admins.has(UniqueEntityID.create(userId));
  }

  async getCauseData(
    communityId: string,
    causeId: string,
  ): Promise<CauseData | null> {
    const communityIdObj = UniqueEntityID.create(communityId);
    const communityOrError = await this.communityRepo.findById(communityIdObj);
    if (communityOrError.isLeft()) {
      return null;
    }
    const community = communityOrError.value;
    const cause = community.getCause(UniqueEntityID.create(causeId));

    if (!cause) {
      return null;
    }

    return {
      communityName: community.name,
      title: cause.title,
      description: cause.description,
      duration: cause.duration,
      ods: cause.ods,
      closed: cause.closed,
      createdAt: cause.createdAt,
    };
  }

  async getMemberships(userIds: string[]): Promise<Map<string, string[]>> {
    return this.communityMemberRepo.listByUserIds(userIds);
  }

  async getUserMemberships(
    userId: string,
  ): Promise<UserMembershipHistoryItem[]> {
    const userMemberships =
      await this.communityMemberRepo.getUserMemberships(userId);
    return userMemberships.map((membership) => ({
      type: 'membership',
      subject: membership.communityName,
      date: membership.joinedAt.toISOString(),
    }));
  }
}
