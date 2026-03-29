import { UserSupportHistoryItem } from '@app/shared/domain/queries/get-my-collaborations.query';
import { Query } from '@nestjs/cqrs';

export class GetMySupportsQuery extends Query<UserSupportHistoryItem[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
