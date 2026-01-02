import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsString } from 'class-validator';

@ApiSchema({
  name: 'Community proposal data',
})
export class ProposeCommunityDto {
  @ApiProperty({
    description: 'Name of the community',
    example: 'Environmental Activists',
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    description: 'Description of the community',
    example: 'A group dedicated to environmental activism and awareness.',
  })
  @IsString()
  readonly description: string;
}
