import { ApiSchema } from '@nestjs/swagger';
import { CauseCreatedDto } from '../../../application/dtos/cause-created.dto';

@ApiSchema({
  name: 'Created cause data',
})
export class CauseCreatedApiDto extends CauseCreatedDto {}
