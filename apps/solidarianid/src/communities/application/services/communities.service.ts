import { DomainEventsPort, Either, left, right } from '@app/shared/domain';
import { CommunityProposal } from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { Injectable } from '@nestjs/common';
import {
  CommunityCreationError,
  CommunityNameAlreadyExistsError,
} from '../../domain/community.aggregate';
import { CommunitiesPort } from '../../domain/ports/community.port';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { CommunityFactory } from '../../domain/services/community-factory.service';
import { CommunityOutDto } from '../dtos/community-out.dto';

@Injectable()
export class CommunitiesService implements CommunitiesPort {
  constructor(
    private readonly domainEvents: DomainEventsPort,
    private readonly communityRepository: CommunityRepository,
    private readonly communityFactory: CommunityFactory,
  ) {}

  async listCommunities(
    search?: string,
    sort?: { field?: 'name' | 'createdAt'; order?: 'ASC' | 'DESC' },
  ): Promise<CommunityOutDto[]> {
    const dbEntities = await this.communityRepository.findAll(search, sort);
    return dbEntities.map((community) => new CommunityOutDto(community));
  }

  async proposeCommunity(
    data: {
      name: string;
      description: string;
    },
    requesterId: string,
  ): Promise<
    Either<
      CommunityCreationError | CommunityNameAlreadyExistsError,
      { proposalId: string }
    >
  > {
    const existingCommunity = await this.communityRepository.existsByName(
      data.name,
    );
    if (existingCommunity) {
      return left(new CommunityNameAlreadyExistsError(data.name));
    }

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
  }): Promise<
    Either<
      CommunityCreationError | CommunityNameAlreadyExistsError,
      CommunityOutDto
    >
  > {
    const communityOrError = await this.communityFactory.createCommunity({
      name: data.name,
      description: data.description,
      adminId: data.requesterId,
    });
    if (communityOrError.isLeft()) {
      return left(communityOrError.value);
    }
    const dto = new CommunityOutDto(communityOrError.value);
    return right(dto);
  }
}
