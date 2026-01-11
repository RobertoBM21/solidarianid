import { Donation } from '../../domain/aggregates/donation.aggregate';

export class DonationDto {
  /**
   * Unique identifier of the donation.
   */
  id: string;

  /**
   * ID of the funding action to which the donation is made.
   */
  fundingActionId: string;

  /**
   * Amount donated.
   */
  amount: number;

  /**
   * ID of the user who made the donation.
   */
  donorId: string;

  /**
   * Date when the donation was created.
   */
  createdAt: string;

  constructor(donation: Donation) {
    this.id = donation.id.toString();
    this.fundingActionId = donation.fundingActionId;
    this.amount = donation.amount;
    this.donorId = donation.donorId;
    this.createdAt = donation.createdAt.toISOString();
  }
}
