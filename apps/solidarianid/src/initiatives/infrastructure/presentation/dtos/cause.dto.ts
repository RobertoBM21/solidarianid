import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  ApiSchema,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  ActionDto,
  FundingActionDto,
  VolunteeringActionDto,
} from './action.dto';

@ApiSchema({ name: 'Cause' })
@ApiExtraModels(FundingActionDto, VolunteeringActionDto)
export class CauseDto {
  @ApiProperty({ description: 'Cause ID' })
  id: string;

  @ApiProperty({ description: 'Community ID the cause belongs to' })
  communityId: string;

  @ApiProperty({ description: 'Title of the cause' })
  title: string;

  @ApiProperty({ description: 'Description of the cause' })
  description: string;

  @ApiProperty({ description: 'Duration of the cause' })
  duration: string;

  @ApiProperty({ description: 'ODS number (1-17)' })
  ods: number;

  @ApiProperty({ description: 'Whether the cause is closed' })
  closed: boolean;

  @ApiProperty({
    description: 'Creation date of the cause (ISO 8601 format)',
  })
  createdAt: string;

  @ApiPropertyOptional({
    description:
      'Whether the current user supports this cause (only present when authenticated)',
  })
  supportedByUser?: boolean;

  @ApiPropertyOptional({
    description: 'Actions associated with this cause',
    isArray: true,
    oneOf: [
      { $ref: getSchemaPath(FundingActionDto) },
      { $ref: getSchemaPath(VolunteeringActionDto) },
    ],
  })
  actions?: ActionDto[];
}
