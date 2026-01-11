import { IsEmail, IsString } from 'class-validator';

export class RegisterDto {
  /**
   * Admin full name.
   * @example 'Admin User'
   */
  @IsString()
  name: string;

  /**
   * Admin email.
   * @example 'admin@example.com'
   */
  @IsEmail()
  email: string;

  /**
   * Admin password.
   */
  @IsString()
  password: string;

  /**
   * Admin phone number.
   * @example '+34 600000000'
   */
  @IsString()
  phone: string;
}
