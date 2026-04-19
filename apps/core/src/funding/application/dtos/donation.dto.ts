import { Donation } from '../../domain/entities/donation.entity';

export class DonationDto {
  /**
   * Unique identifier of the donation.
   */
  readonly id: string;

  /**
   * ID of the funding action to which the donation is made.
   */
  readonly fundingActionId: string;

  /**
   * Amount donated.
   */
  readonly amount: number;

  /**
   * ID of the user who made the donation.
   */
  readonly donorId: string;

  /**
   * Date when the donation was created.
   */
  readonly createdAt: string;

  constructor(donation: Donation) {
    this.id = donation.id.toString();
    this.fundingActionId = donation.fundingActionId;
    this.amount = donation.amount;
    this.donorId = donation.donorId;
    this.createdAt = donation.createdAt.toISOString();
  }
}
