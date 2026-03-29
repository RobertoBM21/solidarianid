import { QueryHandler } from '@nestjs/cqrs';
import { CauseSupportRepository } from '../../domain/repositories/cause-support.repository';
import { UserSupporter } from '../../domain/value-objects/supporter.vo';
import { IsCauseSupportedByUserQuery } from '../queries/is-cause-supported-by-user.query';

@QueryHandler(IsCauseSupportedByUserQuery)
export class IsCauseSupportedByUserHandler {
  constructor(private readonly repository: CauseSupportRepository) {}

  execute(query: IsCauseSupportedByUserQuery): Promise<boolean> {
    const supporter = UserSupporter.create(query.userId);
    return this.repository.existsForSupporterAndCause(supporter, query.causeId);
  }
}
