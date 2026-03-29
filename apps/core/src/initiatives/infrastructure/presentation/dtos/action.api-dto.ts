import { ApiSchema } from '@nestjs/swagger';
import {
  FundingActionOutDto,
  VolunteeringActionOutDto,
} from '../../../application/dtos/action-out.dto';

@ApiSchema({ name: 'FundingAction' })
export class FundingActionApiDto extends FundingActionOutDto {}

@ApiSchema({ name: 'VolunteeringAction' })
export class VolunteeringActionApiDto extends VolunteeringActionOutDto {}

export type ActionApiDto = FundingActionApiDto | VolunteeringActionApiDto;
