import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { CreateCauseData } from '../../../application/ports/causes.port';

@ApiSchema({ name: 'Create cause data' })
export class CreateCauseApiDto implements CreateCauseData {
  @ApiProperty({
    description: 'Title of the cause',
    example: 'Recogida de alimentos',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the cause',
    example: 'Campana para familias vulnerables',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Duration of the cause',
    example: '3 meses',
  })
  @IsString()
  duration: string;

  @ApiProperty({
    description: 'ODS number (1-17)',
    example: 2,
  })
  @IsInt()
  ods: number;
}
