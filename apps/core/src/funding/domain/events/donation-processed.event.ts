import { DomainEvent } from '@app/shared/domain';

export const DONATION_PROCESSED = 'DonationProcessed';

export interface DonationProcessedData {
  donationId: string;
  donorId: string;
  amount: number;
  externalPaymentId: string;
  processedAt: Date;
}

export class DonationProcessed extends DomainEvent {
  readonly type = DONATION_PROCESSED;

  constructor(
    public readonly donationId: string,
    public readonly donorId: string,
    public readonly amount: number,
    public readonly externalPaymentId: string,
    public readonly processedAt: Date,
  ) {
    super();
  }
}
