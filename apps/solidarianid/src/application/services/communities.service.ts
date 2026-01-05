import { DomainEventsPort, Either, left, right } from '@app/shared/domain';
import { CommunityProposal } from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { Injectable } from '@nestjs/common';
import {
  Community,
  CommunityCreationError,
} from '../../domain/aggregates/community.aggregate';
import { CommunitiesRepository } from '../../domain/repositories/communities.repository';
import { CommunityOutDto } from '../dtos/community-out.dto';

@Injectable()
export class CommunitiesService {
  constructor(
    private readonly domainEvents: DomainEventsPort,
    private readonly communitiesRepository: CommunitiesRepository,
  ) {}

  async listCommunities(): Promise<CommunityOutDto[]> {
    const dbEntities = await this.communitiesRepository.findAll();
    return dbEntities.map((community) => new CommunityOutDto(community));
  }

  async proposeCommunity(
    data: {
      name: string;
      description: string;
    },
    requesterId: string,
  ): Promise<Either<CommunityCreationError, { proposalId: string }>> {
    const proposalOrError = CommunityProposal.create({
      name: data.name,
      description: data.description,
      createdAt: new Date(),
      requesterId,
      accepted: null,
    });
    if (proposalOrError.isLeft()) {
      return left(proposalOrError.value);
    }
    await this.domainEvents.dispatch(proposalOrError.value);
    return right({ proposalId: proposalOrError.value.id.toString() });
  }

  async createCommunity(data: {
    name: string;
    description: string;
    requesterId: string;
  }): Promise<Either<CommunityCreationError, CommunityOutDto>> {
    const communityOrError = Community.create({
      name: data.name,
      description: data.description,
      admins: [data.requesterId],
      causes: [],
    });
    if (communityOrError.isLeft()) {
      return left(communityOrError.value);
    }
    await this.communitiesRepository.save(communityOrError.value);
    const dto = new CommunityOutDto(communityOrError.value);
    return right(dto);
  }
}
