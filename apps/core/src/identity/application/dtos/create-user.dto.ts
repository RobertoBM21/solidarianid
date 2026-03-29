import { IsString } from 'class-validator';

export class CreateUserDto {
  /**
   * Full name of the user.
   * @example 'John Doe'
   */
  @IsString()
  name: string;

  /**
   * Email of the user.
   * @example 'john.doe@example.com'
   */
  @IsString()
  email: string;

  /**
   * Phone number of the user.
   * @example '+34 12345678'
   */
  @IsString()
  phone: string;

  /**
   * Password for the user account.
   * @example 'StrongPassword123!'
   */
  @IsString()
  password: string;

  /**
   * City where the user resides.
   * @example 'Madrid'
   */
  @IsString()
  city: string;

  /**
   * Country where the user resides (ISO 3166-1 alpha-2 code).
   * @example 'es'
   */
  @IsString()
  country: string;
}
