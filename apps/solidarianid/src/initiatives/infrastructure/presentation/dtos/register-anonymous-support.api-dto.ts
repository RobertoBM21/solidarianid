import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

@ApiSchema({ name: 'Register anonymous support request' })
export class RegisterAnonymousSupportApiDto {
  @ApiProperty({
    description: 'Name of the anonymous supporter',
    example: 'Anonymous Helper',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email of the anonymous supporter',
    example: 'anon@email.com',
  })
  @IsEmail()
  email: string;
}
