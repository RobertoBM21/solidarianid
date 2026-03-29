import { UniqueEntityID } from '@app/shared/domain';
import { Query } from '@nestjs/cqrs';

export class GetCommunityExistsQuery extends Query<boolean> {
  constructor(public readonly communityId: UniqueEntityID) {
    super();
  }
}
