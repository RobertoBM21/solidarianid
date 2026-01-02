import { DomainError, Repository } from '@app/shared/domain';
import { Community } from '../aggregates/community.aggregate';

export class CommunityNotFoundError implements DomainError {
  readonly message: string;
  constructor(public readonly communityId: string) {
    this.message = `Community with ID ${communityId} not found.`;
  }
}

export abstract class CommunitiesRepository extends Repository<
  Community,
  CommunityNotFoundError
> {
  abstract findAll(): Promise<Community[]>;
}
