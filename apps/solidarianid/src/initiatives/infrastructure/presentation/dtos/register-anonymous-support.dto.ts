import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

@ApiSchema({ name: 'RegisterAnonymousSupportRequest' })
export class RegisterAnonymousSupportDto {
  @ApiProperty({
    description: 'Name of the anonymous supporter',
    example: 'Anonymous Helper',
  })
  @IsString()
  anonymousName: string;

  @ApiProperty({
    description: 'Email of the anonymous supporter',
    example: 'anon@email.com',
  })
  @IsEmail()
  anonymousEmail: string;
}
