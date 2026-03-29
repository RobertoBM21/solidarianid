import { UniqueEntityID } from '@app/shared/domain';
import { Query } from '@nestjs/cqrs';

export class IsCauseSupportedByUserQuery extends Query<boolean> {
  constructor(
    public readonly causeId: UniqueEntityID,
    public readonly userId: UniqueEntityID,
  ) {
    super();
  }
}
