import { IsNumber } from 'class-validator';
import { CreateBaseActionDto } from './create-base-action.dto';

export class CreateFundingActionDto extends CreateBaseActionDto {
  /**
   * Target amount for funding actions.
   * @example 2500
   */
  @IsNumber()
  targetAmount: number;
}
