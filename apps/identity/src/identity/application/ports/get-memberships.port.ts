export abstract class GetMembershipsPort {
  abstract getMemberships(userIds: string[]): Promise<Map<string, string[]>>;
}
