import { DomainError, Repository, UniqueEntityID } from '@app/shared/domain';
import { Community } from '../community.aggregate';

export class CommunityNotFoundError implements DomainError {
  readonly message: string;
  constructor(public readonly communityId: string) {
    this.message = `Community with ID ${communityId} not found.`;
  }
}

export abstract class CommunityRepository extends Repository<
  Community,
  CommunityNotFoundError
> {
  abstract findAll(): Promise<Community[]>;
  abstract exists(id: UniqueEntityID): Promise<boolean>;
}
