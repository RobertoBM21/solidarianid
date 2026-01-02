import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  name: 'Community proposal creation response',
})
export class CommunityProposalDto {
  @ApiProperty({
    description: 'The ID of the community proposal',
  })
  proposalId: string;
}
