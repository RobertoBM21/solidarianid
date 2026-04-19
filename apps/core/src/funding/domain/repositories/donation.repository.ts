import { DomainError, Repository } from '@app/shared/domain';
import { Donation } from '../entities/donation.entity';

export class DonationNotFoundError implements DomainError {
  readonly message: string;
  constructor(public readonly donationId: string) {
    this.message = `Donation with ID ${donationId} not found.`;
  }
}

export abstract class DonationRepository extends Repository<
  Donation,
  DonationNotFoundError
> {
  abstract getTotalDonationsAmount(): Promise<number>;
  abstract findByExternalPaymentId(
    externalPaymentId: string,
  ): Promise<Donation | null>;
}
