export enum MembershipRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export type MembershipRequestVerdict =
  | MembershipRequestStatus.ACCEPTED
  | MembershipRequestStatus.REJECTED;
