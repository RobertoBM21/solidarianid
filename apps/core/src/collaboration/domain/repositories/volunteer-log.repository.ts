import { DomainError, Repository } from '@app/shared/domain';
import { VolunteerLog } from '../aggregates/volunteer-log.aggregate';

export class VolunteerLogNotFoundError implements DomainError {
  readonly message: string;
  constructor(public readonly id: string) {
    this.message = `Volunteer log with ID ${id} not found.`;
  }
}

export abstract class VolunteerLogRepository extends Repository<
  VolunteerLog,
  VolunteerLogNotFoundError
> {}
