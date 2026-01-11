import { Either } from '@app/shared/domain';
import {
  InvalidDateRangeError,
  VolunteerLogCancellationError,
  VolunteerLogCreationError,
  VolunteerLogNotOwnedError,
} from '../../domain/aggregates/volunteer-log.aggregate';
import { VolunteerLogNotFoundError } from '../../domain/repositories/volunteer-log.repository';
import { CreateVolunteerLogDto } from '../dtos/create-volunteer-log.dto';
import { VolunteerLogDto } from '../dtos/volunteer-log.dto';

export abstract class VolunteerLogPort {
  abstract register(
    data: CreateVolunteerLogDto,
    userId: string,
  ): Promise<
    Either<VolunteerLogCreationError | InvalidDateRangeError, VolunteerLogDto>
  >;

  abstract cancel(
    id: string,
    userId: string,
  ): Promise<
    Either<
      | VolunteerLogNotFoundError
      | VolunteerLogCancellationError
      | VolunteerLogNotOwnedError,
      void
    >
  >;
}
