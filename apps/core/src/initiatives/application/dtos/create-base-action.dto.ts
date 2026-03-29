import { IsArray, IsString } from 'class-validator';

export class CreateBaseActionDto {
  /**
   * Title of the action.
   * @example 'Planting Day'
   */
  @IsString()
  title: string;

  /**
   * Description of the action.
   * @example 'Community gathering to plant trees'
   */
  @IsString()
  description: string;

  /**
   * List of objectives for the action.
   * @example ['Target participants: 50']
   */
  @IsArray()
  @IsString({ each: true })
  objectives: string[];
}
