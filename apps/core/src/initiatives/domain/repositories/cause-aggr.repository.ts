import { DomainError, Repository } from '@app/shared/domain';
import { CauseAggr } from '../aggregates/cause.aggregate';

export class CauseNotFoundError implements DomainError {
  readonly message: string;
  constructor(public readonly causeId: string) {
    this.message = `Cause with ID ${causeId} not found.`;
  }
}

export abstract class CauseAggrRepository extends Repository<
  CauseAggr,
  CauseNotFoundError
> {}
