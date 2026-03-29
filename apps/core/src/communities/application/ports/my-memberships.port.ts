import { UserMembershipHistoryItem } from '@app/shared/domain/queries/get-my-collaborations.query';

export abstract class MyMembershipsPort {
  abstract getUserMemberships(
    userId: string,
  ): Promise<UserMembershipHistoryItem[]>;
}
