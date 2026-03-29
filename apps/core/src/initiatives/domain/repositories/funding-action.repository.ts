import { DomainError, Repository } from '@app/shared/domain';
import { FundingAction } from '../aggregates/action.aggregate';

export class FundingActionNotFoundError implements DomainError {
  readonly message: string;
  constructor(public readonly actionId: string) {
    this.message = `Funding action with ID ${actionId} not found.`;
  }
}

export abstract class FundingActionRepository extends Repository<
  FundingAction,
  FundingActionNotFoundError
> {}
