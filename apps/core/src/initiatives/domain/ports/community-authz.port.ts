export abstract class CommunityAuthorizationPort {
  abstract canManageCommunity(
    userId: string,
    communityId: string,
  ): Promise<boolean>;
}
