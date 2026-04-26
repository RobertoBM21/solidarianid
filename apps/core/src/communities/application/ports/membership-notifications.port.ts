export abstract class MembershipNotificationsPort {
  abstract sendMembershipAccepted(
    userId: string,
    communityId: string,
  ): Promise<void>;

  abstract sendMembershipRejected(
    userId: string,
    communityId: string,
  ): Promise<void>;
}
