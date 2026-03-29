import { IsEmail, IsString } from 'class-validator';

export class RegisterAnonymousSupportDto {
  /**
   * Anonymous supporter name.
   */
  @IsString()
  name: string;

  /**
   * Anonymous supporter email.
   */
  @IsEmail()
  email: string;
}
