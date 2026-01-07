import { Either, left, right } from '@app/shared/domain';
import {
  Community,
  CommunityCreationError,
  CommunityNameAlreadyExistsError,
} from '../community.aggregate';
import { CommunityRepository } from '../repositories/community.repository';

export class CommunityFactory {
  constructor(private readonly repository: CommunityRepository) {}

  async createCommunity(data: {
    name: string;
    description: string;
    adminId: string;
  }): Promise<Either<CommunityCreationError, Community>> {
    const nameAlreadyExists = await this.repository.existsByName(data.name);
    if (nameAlreadyExists) {
      return left(new CommunityNameAlreadyExistsError(data.name));
    }

    const communityOrError = Community.create({
      name: data.name,
      description: data.description,
      admins: [data.adminId],
    });
    if (communityOrError.isLeft()) {
      return communityOrError;
    }

    const community = communityOrError.value;
    await this.repository.save(community);
    return right(community);
  }
}
