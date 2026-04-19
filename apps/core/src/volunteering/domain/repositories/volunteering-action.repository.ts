import { DomainError, Repository } from '@app/shared/domain';
import { VolunteeringAction } from '../aggregates/volunteering-action.aggregate';

export class VolunteeringActionNotFoundError implements DomainError {
  readonly message: string;
  constructor(public readonly actionId: string) {
    this.message = `Volunteering action with ID ${actionId} not found.`;
  }
}

export abstract class VolunteeringActionRepository extends Repository<
  VolunteeringAction,
  VolunteeringActionNotFoundError
> {
  abstract findAllByCauseId(causeId: string): Promise<VolunteeringAction[]>;
}
