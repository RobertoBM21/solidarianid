export class CreateCauseDto {
  /**
   * Title of the cause
   * @example 'Recogida de alimentos'
   */
  title: string;

  /**
   * Description of the cause
   * @example 'Campaña para familias vulnerables'
   */
  description: string;

  /**
   * Duration of the cause
   * @example '3 meses'
   */
  duration: string;

  /**
   * ODS number (1-17)
   * @example 2
   */
  ods: number;
}
