import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

@ApiSchema({ name: 'CreateVolunteeringActionRequest' })
export class CreateVolunteeringActionDto {
  @ApiProperty({ description: 'Title of the action' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of the action' })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'List of objectives',
    type: String,
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  objectives: string[];

  @ApiProperty({ description: 'Start date (ISO 8601 format)' })
  @IsString()
  start: string;

  @ApiProperty({ description: 'End date (ISO 8601 format)' })
  @IsString()
  end: string;
}
