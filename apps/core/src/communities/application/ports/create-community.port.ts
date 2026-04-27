import { Either } from '@app/shared/domain';
import { CommunityCreationError } from '../../domain/community.aggregate';

export abstract class CreateCommunityPort {
  abstract createCommunity(data: {
    name: string;
    description: string;
    adminId: string;
  }): Promise<Either<CommunityCreationError, void>>;
}
