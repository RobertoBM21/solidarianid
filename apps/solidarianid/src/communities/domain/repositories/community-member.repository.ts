import {
  DomainError,
  Either,
  Repository,
  UniqueEntityID,
} from '@app/shared/domain';
import { CommunityMember } from '../community-member.aggregate';

export class CommunityMemberNotFoundError implements DomainError {
  readonly message: string;
  constructor(id: string) {
    this.message = `Community member with ID ${id} not found.`;
  }
}

export abstract class CommunityMemberRepository extends Repository<
  CommunityMember,
  CommunityMemberNotFoundError
> {
  abstract findByCommunityId(
    communityId: UniqueEntityID,
  ): Promise<CommunityMember[]>;

  abstract findByCommunityIdAndUserId(
    communityId: UniqueEntityID,
    userId: UniqueEntityID,
  ): Promise<Either<CommunityMemberNotFoundError, CommunityMember>>;
}
