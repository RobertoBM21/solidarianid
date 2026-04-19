import { Type } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';

export class CreateVolunteerLogDto {
  /**
   * The ID of the volunteering action to participate in.
   */
  @IsString()
  volunteeringActionId: string;

  /**
   * The start date and time of the participation.
   */
  @IsDate()
  @Type(() => Date)
  start: Date;

  /**
   * The end date and time of the participation.
   */
  @IsDate()
  @Type(() => Date)
  end: Date;
}
