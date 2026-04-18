import { UserMembershipHistoryItem } from '@app/shared/application/dtos/my-collaborations.dto';

export abstract class GetUserMembershipsPort {
  abstract getUserMemberships(
    userId: string,
  ): Promise<UserMembershipHistoryItem[]>;
}
