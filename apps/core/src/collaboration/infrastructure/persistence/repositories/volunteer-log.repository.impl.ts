import { UniqueEntityID } from '@app/shared/domain';
import { AbstractTypeormRepository } from '@app/shared/infrastructure/persistence/abstract-typeorm.repository';
import { Injectable } from '@nestjs/common';
import { VolunteerLog } from '../../../domain/aggregates/volunteer-log.aggregate';
import {
  VolunteerLogNotFoundError,
  VolunteerLogRepository,
} from '../../../domain/repositories/volunteer-log.repository';
import { VolunteerLogDbEntity } from '../entities/volunteer-log.db-entity';

@Injectable()
export class VolunteerLogRepositoryImpl
  extends AbstractTypeormRepository<
    VolunteerLog,
    VolunteerLogNotFoundError,
    VolunteerLogDbEntity
  >
  implements VolunteerLogRepository
{
  protected readonly dbEntityClass = VolunteerLogDbEntity;
  protected readonly notFoundErrorClass = VolunteerLogNotFoundError;

  protected mapFromDomain(item: VolunteerLog): VolunteerLogDbEntity {
    const entity = new VolunteerLogDbEntity();
    entity.id = item.id.toString();
    entity.userId = item.volunteerId;
    entity.actionId = item.volunteeringActionId;
    entity.start = item.start;
    entity.end = item.end;
    return entity;
  }

  protected mapToDomain(entity: VolunteerLogDbEntity): VolunteerLog {
    const logOrError = VolunteerLog.create(
      {
        volunteerId: entity.userId,
        volunteeringActionId: entity.actionId,
        start: entity.start,
        end: entity.end,
      },
      UniqueEntityID.create(entity.id),
    );

    if (logOrError.isLeft()) {
      throw new Error(
        `Invalid volunteer log entity data for ID ${entity.id}: ${logOrError.value.message}`,
      );
    }
    return logOrError.value;
  }
}
