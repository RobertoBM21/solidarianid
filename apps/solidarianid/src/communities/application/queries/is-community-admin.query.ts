import { UniqueEntityID } from '@app/shared/domain';
import { Query } from '@nestjs/cqrs';

export class IsCommunityAdminQuery extends Query<boolean> {
  constructor(
    public readonly communityId: UniqueEntityID,
    public readonly userId: UniqueEntityID,
  ) {
    super();
  }
}
