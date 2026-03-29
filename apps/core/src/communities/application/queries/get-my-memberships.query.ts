import { UserMembershipHistoryItem } from '@app/shared/domain/queries/get-my-collaborations.query';
import { Query } from '@nestjs/cqrs';

export class GetMyMembershipsQuery extends Query<UserMembershipHistoryItem[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
