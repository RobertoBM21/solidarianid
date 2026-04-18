import {
  DomainEventsPort,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import { CommunityProposal } from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { Injectable } from '@nestjs/common';
import {
  CloseCauseError,
  CommunityCreationError,
  CommunityNameAlreadyExistsError,
} from '../../domain/community.aggregate';
import { Cause, CauseCreationError } from '../../domain/entities/cause.entity';
import {
  CommunityNotFoundError,
  CommunityRepository,
} from '../../domain/repositories/community.repository';
import { CommunityOutDto } from '../dtos/community-out.dto';
import { CreateCauseDto } from '../dtos/create-cause.dto';
import { ProposeCommunityDto } from '../dtos/propose-community.dto';
import { CommunitiesPort } from '../ports/communities.port';

@Injectable()
export class CommunitiesService implements CommunitiesPort {
  constructor(
    private readonly domainEvents: DomainEventsPort,
    private readonly communityRepository: CommunityRepository,
  ) {}

  async listCommunities(
    search?: string,
    sort?: { field?: 'name' | 'createdAt'; order?: 'ASC' | 'DESC' },
  ): Promise<CommunityOutDto[]> {
    const dbEntities = await this.communityRepository.findAll(search, sort);
    return dbEntities.map((community) => new CommunityOutDto(community));
  }

  async getCommunity(
    id: string,
    requesterId?: string,
  ): Promise<Either<CommunityNotFoundError, CommunityOutDto>> {
    const communityOrError = await this.communityRepository.findById(
      UniqueEntityID.create(id),
    );
    if (communityOrError.isLeft()) {
      return left(communityOrError.value);
    }

    const isCommunityAdmin = requesterId
      ? communityOrError.value.admins.has(UniqueEntityID.create(requesterId))
      : undefined;

    return right(new CommunityOutDto(communityOrError.value, isCommunityAdmin));
  }

  async proposeCommunity(
    data: ProposeCommunityDto,
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

  async createCause(
    data: CreateCauseDto,
    communityId: UniqueEntityID,
    requesterId: UniqueEntityID,
  ): Promise<Either<CauseCreationError | CommunityNotFoundError, Cause>> {
    const communityOrError =
      await this.communityRepository.findById(communityId);
    if (communityOrError.isLeft()) {
      return left(communityOrError.value);
    }
    const community = communityOrError.value;

    const causeOrError = community.addCause(
      {
        title: data.title,
        description: data.description,
        duration: data.duration,
        ods: data.ods,
      },
      requesterId,
    );
    if (causeOrError.isLeft()) {
      return left(causeOrError.value);
    }
    const cause = causeOrError.value;
    await this.communityRepository.save(community);
    await this.domainEvents.dispatch(community);
    return right(cause);
  }

  async closeCause(
    communityId: UniqueEntityID,
    causeId: UniqueEntityID,
    requesterId: UniqueEntityID,
  ): Promise<Either<CommunityNotFoundError | CloseCauseError, void>> {
    const communityOrError =
      await this.communityRepository.findById(communityId);
    if (communityOrError.isLeft()) {
      return left(communityOrError.value);
    }
    const community = communityOrError.value;
    const closedOrError = community.closeCause(causeId, requesterId);
    if (closedOrError.isLeft()) {
      return left(closedOrError.value);
    }
    await this.communityRepository.save(community);
    await this.domainEvents.dispatch(community);
    return right(undefined);
  }
}
