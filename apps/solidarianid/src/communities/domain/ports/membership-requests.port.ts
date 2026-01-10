import { Either } from '@app/shared/domain';
import { UserIsNotAdminError } from '../community.aggregate';
import {
  MembershipRequestStatus,
  MembershipRequestVerdict,
} from '../membership-request-status.enum';
import {
  MembershipRequestAlreadyExistsError,
  MembershipRequestCreationError,
  MembershipRequestNotPendingError,
  UserAlreadyMemberError,
} from '../membership-request.aggregate';
import { CommunityNotFoundError } from '../repositories/community.repository';
import { MembershipRequestNotFoundError } from '../repositories/membership-request.repository';

export interface MembershipRequestOut {
  readonly id: string;
  readonly userId: string;
  readonly communityId: string;
  readonly status: MembershipRequestStatus;
  readonly createdAt: string;
}

export abstract class MembershipRequestsPort {
  abstract requestMembership(
    userId: string,
    communityId: string,
  ): Promise<
    Either<
      | CommunityNotFoundError
      | MembershipRequestAlreadyExistsError
      | MembershipRequestCreationError
      | UserAlreadyMemberError,
      MembershipRequestOut
    >
  >;

  abstract listUserRequests(userId: string): Promise<MembershipRequestOut[]>;

  abstract listPendingRequests(
    adminId: string,
    communityId: string,
  ): Promise<
    Either<CommunityNotFoundError | UserIsNotAdminError, MembershipRequestOut[]>
  >;

  abstract reviewRequest(
    adminId: string,
    requestId: string,
    verdict: MembershipRequestVerdict,
  ): Promise<
    Either<
      | MembershipRequestNotFoundError
      | CommunityNotFoundError
      | UserIsNotAdminError
      | MembershipRequestNotPendingError,
      MembershipRequestOut
    >
  >;
}
