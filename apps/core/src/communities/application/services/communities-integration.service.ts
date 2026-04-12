import { UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { Cause } from '../../domain/entities/cause.entity';
import { CommunityRepository } from '../../domain/repositories/community.repository';

@Injectable()
export class CommunitiesIntegrationService {
  constructor(private readonly communityRepo: CommunityRepository) {}

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
}
