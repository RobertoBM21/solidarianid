import { IsString } from 'class-validator';
import { CreateBaseActionDto } from './create-base-action.dto';

export class CreateVolunteeringActionDto extends CreateBaseActionDto {
  /**
   * Start date (ISO 8601 format).
   * @example '2026-01-10T10:00:00.000Z'
   */
  @IsString()
  start: string;

  /**
   * End date (ISO 8601 format).
   * @example '2026-01-10T12:00:00.000Z'
   */
  @IsString()
  end: string;
}
