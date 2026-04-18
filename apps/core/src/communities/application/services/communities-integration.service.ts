import { UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { Cause } from '../../domain/entities/cause.entity';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { UserMembershipHistoryItem } from '@app/shared/application/dtos/my-collaborations.dto';
import { CommunityMemberRepository } from '../../domain/repositories/community-member.repository';

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
    const communityIdOrError =
      await this.communityRepo.findById(communityIdObj);
    if (communityIdOrError.isLeft()) {
      return false;
    }
    const community = communityIdOrError.value;
    return community.admins.has(UniqueEntityID.create(userId));
  }

  async getCauseData(
    communityId: string,
    causeId: string,
  ): Promise<Cause | null> {
    const communityIdObj = UniqueEntityID.create(communityId);
    const communityIdOrError =
      await this.communityRepo.findById(communityIdObj);
    if (communityIdOrError.isLeft()) {
      return null;
    }
    const community = communityIdOrError.value;
    return community.getCause(UniqueEntityID.create(causeId)) ?? null;
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
