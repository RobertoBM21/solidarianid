import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { ok } from 'assert';
import { EntityManager } from 'typeorm';
import {
  Action,
  ActionCreationError,
  FundingAction,
  InvalidActionTypeError,
  VolunteeringAction,
} from '../../../domain/aggregates/action.aggregate';
import {
  ActionNotFoundError,
  ActionRepository,
} from '../../../domain/repositories/action.repository';
import { ActionDbEntity } from '../entities/action.db-entity';

@Injectable()
export class ActionRepositoryImpl extends ActionRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  async save(action: Action): Promise<void> {
    const entity = new ActionDbEntity();
    entity.id = action.id.toString();
    entity.causeId = action.causeId.toString();
    entity.type = action.type;
    entity.title = action.title;
    entity.description = action.description;
    entity.objectives = [...action.objectives];
    entity.closed = action.closed;
    entity.createdAt = action.createdAt;
    if (action instanceof VolunteeringAction) {
      entity.start = action.start;
      entity.end = action.end;
      entity.targetAmount = null;
      entity.currentAmount = 0;
    } else if (action instanceof FundingAction) {
      entity.start = null;
      entity.end = null;
      entity.targetAmount = action.targetAmountValue;
      entity.currentAmount = action.currentAmountValue;
    }

    await this.em.save(ActionDbEntity, entity);
  }

  async findById(
    id: UniqueEntityID,
  ): Promise<Either<ActionNotFoundError, Action>> {
    const entity = await this.em.findOne(ActionDbEntity, {
      where: { id: id.toString() },
    });
    if (!entity) {
      return left(new ActionNotFoundError(id.toString()));
    }
    return right(this.mapToDomain(entity));
  }

  async remove(id: UniqueEntityID): Promise<Either<ActionNotFoundError, void>> {
    const result = await this.em.delete(ActionDbEntity, {
      id: id.toString(),
    });
    if (result.affected === 0) {
      return left(new ActionNotFoundError(id.toString()));
    }
    return right(undefined);
  }

  async listByCause(causeId: UniqueEntityID): Promise<Action[]> {
    const entities = await this.em.find(ActionDbEntity, {
      where: { causeId: causeId.toString() },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.mapToDomain(entity));
  }

  private mapToDomain(entity: ActionDbEntity): Action {
    let actionOrError: Either<ActionCreationError, Action>;
    switch (entity.type) {
      case 'volunteering':
        ok(entity.start !== null && entity.end !== null);
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
        break;
      case 'funding':
        ok(entity.targetAmount !== null);
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
        break;
      default:
        actionOrError = left(new InvalidActionTypeError());
    }
    if (actionOrError.isLeft()) {
      throw new Error(
        `Invalid action entity data for ID ${entity.id}: ${actionOrError.value.message}`,
      );
    }
    return actionOrError.value;
  }
}
