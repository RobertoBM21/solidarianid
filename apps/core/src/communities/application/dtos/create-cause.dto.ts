import { IsInt, IsString } from 'class-validator';

export class CreateCauseDto {
  /**
   * Title of the cause
   * @example 'Recogida de alimentos'
   */
  @IsString()
  title: string;

  /**
   * Description of the cause
   * @example 'Campaña para familias vulnerables'
   */
  @IsString()
  description: string;

  /**
   * Duration of the cause
   * @example '3 meses'
   */
  @IsString()
  duration: string;

  /**
   * ODS number (1-17)
   * @example 2
   */
  @IsInt()
  ods: number;
}
