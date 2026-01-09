import { DomainError, Repository, UniqueEntityID } from '@app/shared/domain';
import { CommunityMember } from '../entities/community-member.entity';

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
}
