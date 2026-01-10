import { ApiProperty, ApiSchema } from '@nestjs/swagger';

class BaseActionApiDto {
  @ApiProperty({ description: 'Action ID' })
  id: string;

  @ApiProperty({ description: 'Cause ID the action belongs to' })
  causeId: string;

  @ApiProperty({
    description: 'Action type',
    enum: ['funding', 'volunteering'],
  })
  type: 'funding' | 'volunteering';

  @ApiProperty({ description: 'Title of the action' })
  title: string;

  @ApiProperty({ description: 'Description of the action' })
  description: string;

  @ApiProperty({
    description: 'List of objectives for the action',
    type: String,
    isArray: true,
  })
  objectives: string[];

  @ApiProperty({ description: 'Whether the action is closed' })
  closed: boolean;

  @ApiProperty({
    description: 'Creation date of the action (ISO 8601 format)',
  })
  createdAt: string;
}

@ApiSchema({ name: 'FundingAction' })
export class FundingActionApiDto extends BaseActionApiDto {
  type = 'funding' as const;

  @ApiProperty({ description: 'Target amount for funding actions' })
  targetAmount: number;

  @ApiProperty({ description: 'Current amount for funding actions' })
  currentAmount: number;
}

@ApiSchema({ name: 'VolunteeringAction' })
export class VolunteeringActionApiDto extends BaseActionApiDto {
  type = 'volunteering' as const;

  @ApiProperty({ description: 'Start date (ISO 8601 format)' })
  start: string;

  @ApiProperty({ description: 'End date (ISO 8601 format)' })
  end: string;
}

export type ActionApiDto = FundingActionApiDto | VolunteeringActionApiDto;
