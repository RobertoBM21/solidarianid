import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
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
}
