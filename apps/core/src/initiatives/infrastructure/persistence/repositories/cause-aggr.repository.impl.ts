import { AbstractTypeormRepository } from '@app/shared/infrastructure/persistence/abstract-typeorm.repository';
import { Injectable } from '@nestjs/common';
import { CauseAggr } from '../../../domain/aggregates/cause.aggregate';
import {
  CauseAggrRepository,
  CauseNotFoundError,
} from '../../../domain/repositories/cause-aggr.repository';
import { CauseAggrDbEntity } from '../entities/cause-aggr.db-entity';

@Injectable()
export class CauseAggrRepositoryImpl
  extends AbstractTypeormRepository<
    CauseAggr,
    CauseNotFoundError,
    CauseAggrDbEntity
  >
  implements CauseAggrRepository
{
  protected readonly dbEntityClass = CauseAggrDbEntity;
  protected readonly notFoundErrorClass = CauseNotFoundError;

  protected mapFromDomain(item: CauseAggr): CauseAggrDbEntity {
    const entity = new CauseAggrDbEntity();
    entity.id = item.id.toString();
    entity.title = item.title;
    entity.communityId = item.communityId.toString();
    entity.closed = item.closed;
    return entity;
  }

  protected mapToDomain(entity: CauseAggrDbEntity): CauseAggr {
    const causeAggrOrError = CauseAggr.create({
      id: entity.id,
      title: entity.title,
      communityId: entity.communityId,
      closed: entity.closed,
    });
    if (causeAggrOrError.isLeft()) {
      // Should never happen
      throw new Error('Failed to map CauseAggrDbEntity to CauseAggr');
    }
    return causeAggrOrError.value;
  }
}
