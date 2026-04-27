export abstract class MembershipNotificationsPort {
  abstract sendMembershipDecision(
    userId: string,
    communityName: string,
    accepted: boolean,
  ): Promise<void>;
}
