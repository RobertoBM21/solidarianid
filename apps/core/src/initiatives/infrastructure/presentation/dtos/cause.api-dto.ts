import {
  ApiExtraModels,
  ApiProperty,
  ApiSchema,
  getSchemaPath,
} from '@nestjs/swagger';
import { CauseDto } from '../../../application/dtos/cause.dto';
import {
  ActionApiDto,
  FundingActionApiDto,
  VolunteeringActionApiDto,
} from './action.api-dto';

@ApiSchema({ name: 'Cause' })
@ApiExtraModels(FundingActionApiDto, VolunteeringActionApiDto)
export class CauseApiDto extends CauseDto {
  @ApiProperty({
    description: 'Actions associated with this cause',
    isArray: true,
    oneOf: [
      { $ref: getSchemaPath(FundingActionApiDto) },
      { $ref: getSchemaPath(VolunteeringActionApiDto) },
    ],
  })
  declare actions: ActionApiDto[];
}
