import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { AbstractTypeormRepository } from '@app/shared/infrastructure/persistence/abstract-typeorm.repository';
import { Injectable } from '@nestjs/common';
import { CauseAggr } from '../../../domain/aggregates/cause.aggregate';
import {
  ActionDefEntity,
  FundingActionDef,
  VolunteeringActionDef,
} from '../../../domain/entities/action.entity';
import {
  CauseAggrRepository,
  CauseNotFoundError,
} from '../../../domain/repositories/cause-aggr.repository';
import { ActionDbEntity } from '../entities/action.db-entity';
import { CauseAggrDbEntity } from '../entities/cause-aggr.db-entity';
import { FundingActionDbEntity } from '../entities/funding-action.db-entity';
import { VolunteeringActionDbEntity } from '../entities/volunteering-action.db-entity';

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

  async findById(
    id: UniqueEntityID,
  ): Promise<Either<CauseNotFoundError, CauseAggr>> {
    const entity = await this.em.findOne(CauseAggrDbEntity, {
      where: { id: id.toString() },
      relations: { actions: true },
    });
    if (!entity) {
      return left(new CauseNotFoundError(id.toString()));
    }
    return right(this.mapToDomain(entity));
  }

  protected mapFromDomain(item: CauseAggr): CauseAggrDbEntity {
    const entity = new CauseAggrDbEntity();
    entity.id = item.id.toString();
    entity.title = item.title;
    entity.communityId = item.communityId.toString();
    entity.closed = item.closed;
    entity.actions = item.actions.map((action) =>
      this.mapActionFromDomain(action, entity),
    );
    return entity;
  }

  protected mapToDomain(entity: CauseAggrDbEntity): CauseAggr {
    const actions = entity.actions.map((actionEntity) =>
      this.mapActionToDomain(actionEntity),
    );

    const causeAggrOrError = CauseAggr.create({
      id: entity.id,
      title: entity.title,
      communityId: entity.communityId,
      closed: entity.closed,
      actions,
    });
    if (causeAggrOrError.isLeft()) {
      throw new Error('Failed to map CauseAggrDbEntity to CauseAggr');
    }
    return causeAggrOrError.value;
  }

  private mapActionFromDomain(
    action: ActionDefEntity,
    causeEntity: CauseAggrDbEntity,
  ): ActionDbEntity {
    let entity: ActionDbEntity;
    if (action instanceof VolunteeringActionDef) {
      const vol = new VolunteeringActionDbEntity();
      vol.start = action.start;
      vol.end = action.end;
      entity = vol;
    } else if (action instanceof FundingActionDef) {
      const fund = new FundingActionDbEntity();
      fund.targetAmount = action.targetAmountValue;
      fund.currentAmount = action.currentAmountValue;
      entity = fund;
    } else {
      throw new Error(`Unknown action type: cannot map to DB entity`);
    }
    entity.id = action.id.toString();
    entity.causeId = causeEntity.id;
    entity.causeAggr = causeEntity;
    entity.title = action.title;
    entity.description = action.description;
    entity.objectives = [...action.objectives];
    entity.closed = action.closed;
    entity.createdAt = action.createdAt;
    return entity;
  }

  private mapActionToDomain(entity: ActionDbEntity): ActionDefEntity {
    if (entity instanceof VolunteeringActionDbEntity) {
      const result = VolunteeringActionDef.create(
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
      if (result.isLeft()) {
        throw new Error(
          `Invalid volunteering action entity data for ID ${entity.id}: ${result.value.message}`,
        );
      }
      return result.value;
    }
    if (entity instanceof FundingActionDbEntity) {
      const result = FundingActionDef.create(
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
      if (result.isLeft()) {
        throw new Error(
          `Invalid funding action entity data for ID ${entity.id}: ${result.value.message}`,
        );
      }
      return result.value;
    }
    throw new Error(
      `Unknown action entity type for ID ${entity.id}: cannot map to domain`,
    );
  }
}
