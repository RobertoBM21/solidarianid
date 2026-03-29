import { Type } from 'class-transformer';
import { ValidateNested, IsUUID } from 'class-validator';
import { RegisterAnonymousSupportDto } from './register-anonymous-support.dto';

export class RegisterAnonymousSupportRequestDto {
  /**
   * Cause ID to support.
   */
  @IsUUID()
  causeId: string;

  /**
   * Anonymous supporter data.
   */
  @ValidateNested()
  @Type(() => RegisterAnonymousSupportDto)
  data: RegisterAnonymousSupportDto;
}
