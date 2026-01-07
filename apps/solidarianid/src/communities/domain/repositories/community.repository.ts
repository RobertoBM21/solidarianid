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
  abstract exists(id: UniqueEntityID): Promise<boolean>;
  abstract existsByName(name: string): Promise<boolean>;
  abstract findAll(
    search?: string,
    sort?: { field?: 'name' | 'createdAt'; order?: 'ASC' | 'DESC' },
  ): Promise<Community[]>;
}
