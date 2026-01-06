import { Either } from '@app/shared/domain';
import { CommunityCreationError } from '../community.aggregate';

export interface CommunityListOut {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly createdAt: string;
}

export abstract class CommunitiesPort {
  abstract listCommunities(): Promise<CommunityListOut[]>;

  abstract proposeCommunity(
    data: {
      name: string;
      description: string;
    },
    requesterId: string,
  ): Promise<Either<CommunityCreationError, { proposalId: string }>>;

  abstract createCommunity(data: {
    name: string;
    description: string;
    requesterId: string;
  }): Promise<Either<CommunityCreationError, CommunityListOut>>;
}
