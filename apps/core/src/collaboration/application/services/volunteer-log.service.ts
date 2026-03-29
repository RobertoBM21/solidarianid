import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import {
  VolunteerLog,
  VolunteerLogCancellationError,
  VolunteerLogCreationError,
  VolunteerLogNotOwnedError,
} from '../../domain/aggregates/volunteer-log.aggregate';
import {
  VolunteerLogNotFoundError,
  VolunteerLogRepository,
} from '../../domain/repositories/volunteer-log.repository';
import { CreateVolunteerLogDto } from '../dtos/create-volunteer-log.dto';
import { VolunteerLogDto } from '../dtos/volunteer-log.dto';
import { VolunteerLogPort } from '../ports/volunteer-log.port';

@Injectable()
export class VolunteerLogService implements VolunteerLogPort {
  constructor(
    private readonly volunteerLogRepository: VolunteerLogRepository,
  ) {}

  async register(
    data: CreateVolunteerLogDto,
    userId: string,
  ): Promise<Either<VolunteerLogCreationError, VolunteerLogDto>> {
    const result = VolunteerLog.create({
      volunteerId: userId,
      volunteeringActionId: data.volunteeringActionId,
      start: data.start,
      end: data.end,
    });

    if (result.isLeft()) {
      return left(result.value);
    }

    await this.volunteerLogRepository.save(result.value);

    return right(new VolunteerLogDto(result.value));
  }

  async cancel(
    id: string,
    userId: string,
  ): Promise<
    Either<
      | VolunteerLogNotFoundError
      | VolunteerLogCancellationError
      | VolunteerLogNotOwnedError,
      void
    >
  > {
    const logId = UniqueEntityID.create(id);

    const logOrError = await this.volunteerLogRepository.findById(logId);

    if (logOrError.isLeft()) {
      return left(logOrError.value);
    }

    const cancellationResult = logOrError.value.canCancel(userId);
    if (cancellationResult.isLeft()) {
      return left(cancellationResult.value);
    }

    const result = await this.volunteerLogRepository.remove(logId);
    if (result.isLeft()) {
      return left(result.value);
    }

    return right(undefined);
  }
}
