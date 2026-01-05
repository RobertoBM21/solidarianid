import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  name: 'User output data',
})
export class UserOutDto {
  @ApiProperty({
    description: 'The ID of the user',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the user',
  })
  name: string;

  @ApiProperty({
    description: 'Email of the user',
  })
  email: string;

  @ApiProperty({
    description: 'Phone number of the user',
  })
  phone: string;

  @ApiProperty({
    description: 'City where the user resides',
  })
  city: string;

  @ApiProperty({
    description: 'Country where the user resides',
  })
  country: string;
}
