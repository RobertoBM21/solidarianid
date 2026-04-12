import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  /**
   * Full name of the user.
   * @example 'John Doe'
   */
  @IsString()
  name: string;

  /**
   * User email.
   * @example 'john.doe@example.com'
   */
  @IsEmail()
  email: string;

  /**
   * Phone number of the user.
   * @example '+34 12345678'
   */
  @IsString()
  phone: string;

  /**
   * Password for the user account.
   */
  @IsString()
  password: string;

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
