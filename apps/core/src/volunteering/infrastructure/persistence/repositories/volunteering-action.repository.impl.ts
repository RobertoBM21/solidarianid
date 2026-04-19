import { AbstractTypeormRepository } from '@app/shared/infrastructure/persistence/abstract-typeorm.repository';
import { Injectable } from '@nestjs/common';
import { VolunteeringAction } from '../../../domain/aggregates/volunteering-action.aggregate';
import {
  VolunteeringActionNotFoundError,
  VolunteeringActionRepository,
} from '../../../domain/repositories/volunteering-action.repository';
import { VolunteeringActionAggrDbEntity } from '../entities/volunteering-action-aggr.db-entity';

@Injectable()
export class VolunteeringActionRepositoryImpl
  extends AbstractTypeormRepository<
    VolunteeringAction,
    VolunteeringActionNotFoundError,
    VolunteeringActionAggrDbEntity
  >
  implements VolunteeringActionRepository
{
  protected readonly dbEntityClass = VolunteeringActionAggrDbEntity;
  protected readonly notFoundErrorClass = VolunteeringActionNotFoundError;

  async findAllByCauseId(causeId: string): Promise<VolunteeringAction[]> {
    const entities = await this.em.find(VolunteeringActionAggrDbEntity, {
      where: { causeId },
    });
    return entities.map((entity) => this.mapToDomain(entity));
  }

  protected mapFromDomain(
    item: VolunteeringAction,
  ): VolunteeringActionAggrDbEntity {
    const entity = new VolunteeringActionAggrDbEntity();
    entity.id = item.id.toString();
    entity.causeId = item.causeId.toString();
    entity.title = item.title;
    entity.closed = item.closed;
    return entity;
  }

  protected mapToDomain(
    entity: VolunteeringActionAggrDbEntity,
  ): VolunteeringAction {
    const actionOrError = VolunteeringAction.create(
      {
        title: entity.title,
        causeId: entity.causeId,
        closed: entity.closed,
      },
      entity.id,
    );
    if (actionOrError.isLeft()) {
      throw new Error(
        `Error mapping VolunteeringAction DB entity to domain: ${actionOrError.value.message}`,
      );
    }
    return actionOrError.value;
  }
}
