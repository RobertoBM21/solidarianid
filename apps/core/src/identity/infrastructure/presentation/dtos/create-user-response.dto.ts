import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  name: 'Create user response data',
})
export class CreateUserResponseDto {
  @ApiProperty({
    description: 'The ID of the newly created user',
  })
  userId: string;
}
