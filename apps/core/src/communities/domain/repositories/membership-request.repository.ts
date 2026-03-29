import {
  DomainError,
  Either,
  Repository,
  UniqueEntityID,
} from '@app/shared/domain';
import { MembershipRequest } from '../membership-request.aggregate';

export class MembershipRequestNotFoundError implements DomainError {
  readonly message: string;
  constructor(public readonly membershipRequestId: string) {
    this.message = `Membership Request with ID ${membershipRequestId} not found.`;
  }
}

export abstract class MembershipRequestRepository extends Repository<
  MembershipRequest,
  MembershipRequestNotFoundError
> {
  abstract findPendingByCommunityId(
    communityId: UniqueEntityID,
  ): Promise<MembershipRequest[]>;
  abstract findByUserId(userId: UniqueEntityID): Promise<MembershipRequest[]>;
  abstract findByUserAndCommunity(
    userId: UniqueEntityID,
    communityId: UniqueEntityID,
  ): Promise<Either<MembershipRequestNotFoundError, MembershipRequest>>;
}
