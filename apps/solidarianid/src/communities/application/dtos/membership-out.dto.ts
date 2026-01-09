import { MembershipRequestStatus } from '../../domain/membership-request-status.enum';
import { MembershipRequest } from '../../domain/membership-request.aggregate';
import { MembershipRequestOut } from '../../domain/ports/membership-requests.port';

export class MembershipRequestOutDto implements MembershipRequestOut {
  readonly id: string;
  readonly userId: string;
  readonly communityId: string;
  readonly status: MembershipRequestStatus;
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
