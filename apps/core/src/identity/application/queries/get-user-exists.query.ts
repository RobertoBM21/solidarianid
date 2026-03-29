import { UniqueEntityID } from '@app/shared/domain';
import { Query } from '@nestjs/cqrs';

export class GetUserExistsQuery extends Query<boolean> {
  constructor(public readonly userId: UniqueEntityID) {
    super();
  }
}
