import { Either, left, right } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import {
  Community,
  CommunityCreationError,
  CommunityNameAlreadyExistsError,
} from '../../domain/community.aggregate';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { CreateCommunityPort } from '../ports/create-community.port';

@Injectable()
export class CreateCommunityService extends CreateCommunityPort {
  constructor(private readonly repository: CommunityRepository) {
    super();
  }

  async createCommunity(data: {
    name: string;
    description: string;
    adminId: string;
  }): Promise<Either<CommunityCreationError, void>> {
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
      return left(communityOrError.value);
    }

    const community = communityOrError.value;
    await this.repository.save(community);
    return right(undefined);
  }
}
