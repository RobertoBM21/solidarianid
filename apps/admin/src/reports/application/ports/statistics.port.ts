import { DomainEventError, Either } from '@app/shared/domain';
import { StatisticsDto } from '../dtos/statistics.dto';

export abstract class StatisticsPort {
  abstract getGlobalStatistics(): Promise<
    Either<DomainEventError, StatisticsDto>
  >;
}
