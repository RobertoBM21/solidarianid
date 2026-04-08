import { Either } from '@app/shared/domain';
import { CauseNotFoundError } from '../../domain/repositories/cause-aggr.repository';
import { CauseDto } from '../dtos/cause.dto';

export abstract class CausesPort {
  abstract getCause(
    causeId: string,
    userId?: string,
  ): Promise<Either<CauseNotFoundError, CauseDto>>;
}
