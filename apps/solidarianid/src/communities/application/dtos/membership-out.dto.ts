import { MembershipRequestStatus } from '../../domain/membership-request-status.enum';
import { MembershipRequest } from '../../domain/membership-request.aggregate';
export class MembershipRequestOutDto {
  /**
   * The unique identifier of the membership request.
   */
  readonly id: string;
  /**
   * The unique identifier of the user.
   */
  readonly userId: string;
  /**
   * The unique identifier of the community.
   */
  readonly communityId: string;
  /**
   * The status of the membership request.
   */
  readonly status: MembershipRequestStatus;
  /**
   * The date and time when the request was created (ISO 8601 format).
   */
  readonly createdAt: string;

  constructor(request: MembershipRequest) {
    this.id = request.id.toString();
    this.userId = request.userId.toString();
    this.communityId = request.communityId.toString();
    this.status = request.isPending()
      ? MembershipRequestStatus.PENDING
      : request.accepted
        ? MembershipRequestStatus.ACCEPTED
        : MembershipRequestStatus.REJECTED;
    this.createdAt = request.createdAt.toISOString();
  }
}
