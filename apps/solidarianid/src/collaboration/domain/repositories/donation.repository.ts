import { DomainError, Repository } from '@app/shared/domain';
import { Donation } from '../aggregates/donation.aggregate';

export class DonationNotFoundError implements DomainError {
  readonly message: string;
  constructor(public readonly donationId: string) {
    this.message = `Donation with ID ${donationId} not found.`;
  }
}

export abstract class DonationRepository extends Repository<
  Donation,
  DonationNotFoundError
> {}
