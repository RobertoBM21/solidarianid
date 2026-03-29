import { Either } from '@app/shared/domain';
import { UserIsNotAdminError } from '../../domain/community.aggregate';
import { MembershipRequestVerdict } from '../../domain/membership-request-status.enum';
import {
  MembershipRequestAlreadyExistsError,
  MembershipRequestCreationError,
  MembershipRequestNotPendingError,
  UserAlreadyMemberError,
} from '../../domain/membership-request.aggregate';
import { CommunityNotFoundError } from '../../domain/repositories/community.repository';
import { MembershipRequestNotFoundError } from '../../domain/repositories/membership-request.repository';
import { MembershipRequestOutDto } from '../dtos/membership-out.dto';

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
      MembershipRequestOutDto
    >
  >;

  abstract listUserRequests(userId: string): Promise<MembershipRequestOutDto[]>;

  abstract listPendingRequests(
    adminId: string,
    communityId: string,
  ): Promise<
    Either<
      CommunityNotFoundError | UserIsNotAdminError,
      MembershipRequestOutDto[]
    >
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
      MembershipRequestOutDto
    >
  >;
}
