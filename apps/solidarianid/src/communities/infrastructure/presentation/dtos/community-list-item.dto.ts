import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  name: 'Communities list item',
})
export class CommunityListItemDto {
  @ApiProperty({
    description: 'The ID of the community',
  })
  readonly id: string;

  @ApiProperty({
    description: 'The name of the community',
  })
  readonly name: string;

  @ApiProperty({
    description: 'The description of the community',
  })
  readonly description: string;

  @ApiProperty({
    description: 'The creation date of the community (ISO 8601 format)',
  })
  readonly createdAt: string;
}
