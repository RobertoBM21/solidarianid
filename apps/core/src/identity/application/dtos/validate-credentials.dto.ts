import { IsEmail, IsString } from 'class-validator';

export class ValidateCredentialsDto {
  /**
   * User email.
   * @example 'john.doe@example.com'
   */
  @IsEmail()
  email: string;

  /**
   * User password.
   * @example 'StrongPassword123!'
   */
  @IsString()
  password: string;
}
