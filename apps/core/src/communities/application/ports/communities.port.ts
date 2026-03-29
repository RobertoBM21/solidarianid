import { Either } from '@app/shared/domain';
import { CommunityCreationError } from '../../domain/community.aggregate';
import { CommunityOutDto } from '../dtos/community-out.dto';
import { ProposeCommunityDto } from '../dtos/propose-community.dto';

export abstract class CommunitiesPort {
  abstract listCommunities(
    search?: string,
    sort?: { field?: 'name' | 'createdAt'; order?: 'ASC' | 'DESC' },
  ): Promise<CommunityOutDto[]>;

  abstract proposeCommunity(
    data: ProposeCommunityDto,
    requesterId: string,
  ): Promise<Either<CommunityCreationError, { proposalId: string }>>;
}
