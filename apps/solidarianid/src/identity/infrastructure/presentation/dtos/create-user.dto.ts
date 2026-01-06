import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsString } from 'class-validator';

@ApiSchema({
  name: 'Create user data',
})
export class CreateUserDto {
  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'john.doe@example.com',
  })
  @IsString()
  readonly email: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+34 12345678',
  })
  @IsString()
  readonly phone: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'StrongPassword123!',
  })
  @IsString()
  readonly password: string;

  @ApiProperty({
    description: 'City where the user resides',
    example: 'Madrid',
  })
  @IsString()
  readonly city: string;

  @ApiProperty({
    description: 'Country where the user resides',
    example: 'Spain',
  })
  @IsString()
  readonly country: string;
}
