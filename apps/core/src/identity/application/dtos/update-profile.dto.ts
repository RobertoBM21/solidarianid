import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  /**
   * Full name of the user.
   * @example 'John Doe'
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * Phone number of the user.
   * @example '+34 12345678'
   */
  @IsString()
  @IsOptional()
  phone?: string;

  /**
   * City where the user resides.
   * @example 'Madrid'
   */
  @IsString()
  @IsOptional()
  city?: string;

  /**
   * Country where the user resides (ISO 3166-1 alpha-2 code).
   * @example 'es'
   */
  @IsString()
  @IsOptional()
  country?: string;
}
