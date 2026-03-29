import { Either, UniqueEntityID } from '@app/shared/domain';
import { AbstractTypeormRepository } from '@app/shared/infrastructure/persistence/abstract-typeorm.repository';
import { Injectable } from '@nestjs/common';
import {
  Action,
  ActionCreationError,
  FundingAction,
  VolunteeringAction,
} from '../../../domain/aggregates/action.aggregate';
import {
  ActionNotFoundError,
  ActionRepository,
} from '../../../domain/repositories/action.repository';
import { ActionDbEntity } from '../entities/action.db-entity';
import { FundingActionDbEntity } from '../entities/funding-action.db-entity';
import { VolunteeringActionDbEntity } from '../entities/volunteering-action.db-entity';

@Injectable()
export class ActionRepositoryImpl
  extends AbstractTypeormRepository<Action, ActionNotFoundError, ActionDbEntity>
  implements ActionRepository
{
  protected readonly dbEntityClass = ActionDbEntity;
  protected readonly notFoundErrorClass = ActionNotFoundError;

  async listByCause(causeId: UniqueEntityID): Promise<Action[]> {
    const entities = await this.em.find(ActionDbEntity, {
      where: { causeId: causeId.toString() },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.mapToDomain(entity));
  }

  protected mapFromDomain(item: Action): ActionDbEntity {
    let entity: ActionDbEntity;
    if (item instanceof VolunteeringAction) {
      const volunteeringEntity = new VolunteeringActionDbEntity();
      volunteeringEntity.start = item.start;
      volunteeringEntity.end = item.end;
      entity = volunteeringEntity;
    } else if (item instanceof FundingAction) {
      const fundingEntity = new FundingActionDbEntity();
      fundingEntity.targetAmount = item.targetAmountValue;
      fundingEntity.currentAmount = item.currentAmountValue;
      entity = fundingEntity;
    } else {
      throw new Error(
        `Unknown action type for ID ${item.id.toString()}: cannot map to DB entity`,
      );
    }
    entity.id = item.id.toString();
    entity.causeId = item.causeId.toString();
    entity.title = item.title;
    entity.description = item.description;
    entity.objectives = [...item.objectives];
    entity.closed = item.closed;
    entity.createdAt = item.createdAt;
    return entity;
  }

  protected mapToDomain(entity: ActionDbEntity): Action {
    let actionOrError: Either<ActionCreationError, Action>;
    if (entity instanceof VolunteeringActionDbEntity) {
      actionOrError = VolunteeringAction.create(
        {
          title: entity.title,
          description: entity.description,
          objectives: entity.objectives,
          closed: entity.closed,
          createdAt: entity.createdAt,
          causeId: entity.causeId,
          start: entity.start,
          end: entity.end,
        },
        entity.id,
      );
    } else if (entity instanceof FundingActionDbEntity) {
      actionOrError = FundingAction.create(
        {
          title: entity.title,
          description: entity.description,
          objectives: entity.objectives,
          closed: entity.closed,
          createdAt: entity.createdAt,
          causeId: entity.causeId,
          targetAmount: entity.targetAmount,
          currentAmount: entity.currentAmount,
        },
        entity.id,
      );
    } else {
      throw new Error(
        `Unknown action entity type for ID ${entity.id}: cannot map to domain`,
      );
    }
    if (actionOrError.isLeft()) {
      throw new Error(
        `Invalid action entity data for ID ${entity.id}: ${actionOrError.value.message}`,
      );
    }
    return actionOrError.value;
  }
}
