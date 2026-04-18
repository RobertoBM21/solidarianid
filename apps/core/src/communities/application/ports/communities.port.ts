import { Either, UniqueEntityID } from '@app/shared/domain';
import {
  CloseCauseError,
  CommunityCreationError,
} from '../../domain/community.aggregate';
import { Cause, CauseCreationError } from '../../domain/entities/cause.entity';
import { CommunityNotFoundError } from '../../domain/repositories/community.repository';
import { CommunityOutDto } from '../dtos/community-out.dto';
import { CreateCauseDto } from '../dtos/create-cause.dto';
import { ProposeCommunityDto } from '../dtos/propose-community.dto';

export abstract class CommunitiesPort {
  abstract listCommunities(
    search?: string,
    sort?: { field?: 'name' | 'createdAt'; order?: 'ASC' | 'DESC' },
  ): Promise<CommunityOutDto[]>;

  abstract getCommunity(
    id: string,
    requesterId?: string,
  ): Promise<Either<CommunityNotFoundError, CommunityOutDto>>;

  abstract proposeCommunity(
    data: ProposeCommunityDto,
    requesterId: string,
  ): Promise<Either<CommunityCreationError, { proposalId: string }>>;

  abstract createCause(
    data: CreateCauseDto,
    communityId: UniqueEntityID,
    requesterId: UniqueEntityID,
  ): Promise<Either<CauseCreationError | CommunityNotFoundError, Cause>>;

  abstract closeCause(
    communityId: UniqueEntityID,
    causeId: UniqueEntityID,
    requesterId: UniqueEntityID,
  ): Promise<Either<CommunityNotFoundError | CloseCauseError, void>>;
}
