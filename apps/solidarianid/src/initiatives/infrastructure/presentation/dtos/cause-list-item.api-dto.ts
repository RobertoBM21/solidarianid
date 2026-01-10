import { ApiSchema } from '@nestjs/swagger';
import { CauseListItemDto } from '../../../application/dtos/cause-list-item.dto';

@ApiSchema({ name: 'Cause (list item)' })
export class CauseListItemApiDto extends CauseListItemDto {}
