import { IsEmail, IsString } from 'class-validator';

export class GoogleUserDto {
  /**
   * User email from Google profile.
   * @example 'john.doe@gmail.com'
   */
  @IsEmail()
  email: string;

  /**
   * User display name from Google profile.
   * @example 'John Doe'
   */
  @IsString()
  name: string;
}
