import { IsUUID } from 'class-validator';

export class RegisterUserSupportDto {
  /**
   * Cause ID to support.
   */
  @IsUUID()
  causeId: string;

  /**
   * User ID supporting the cause.
   */
  @IsUUID()
  userId: string;
}
