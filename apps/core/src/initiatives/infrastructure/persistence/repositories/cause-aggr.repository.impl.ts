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
    entity.communityId = item.communityId.toString();
    entity.closed = item.closed;
    return entity;
  }

  protected mapToDomain(entity: CauseAggrDbEntity): CauseAggr {
    return CauseAggr.create({
      id: entity.id,
      communityId: entity.communityId,
      closed: entity.closed,
    });
  }
}
