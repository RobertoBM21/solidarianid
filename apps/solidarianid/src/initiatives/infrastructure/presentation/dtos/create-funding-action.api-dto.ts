import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';

@ApiSchema({ name: 'Create funding action request' })
export class CreateFundingActionApiDto {
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

  @ApiProperty({ description: 'Target amount for funding actions' })
  @IsNumber()
  targetAmount: number;
}
