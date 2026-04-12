import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  /**
   * User email.
   * @example 'john.doe@example.com'
   */
  @IsEmail()
  email: string;

  /**
   * User password.
   */
  @IsString()
  password: string;
}
