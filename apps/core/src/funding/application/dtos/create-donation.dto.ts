import { IsNumber, IsString } from 'class-validator';

export class CreateDonationDto {
  /**
   * ID of the funding action to which the donation is made.
   */
  @IsString()
  fundingActionId: string;

  /**
   * Amount to be donated.
   */
  @IsNumber()
  amount: number;
}
