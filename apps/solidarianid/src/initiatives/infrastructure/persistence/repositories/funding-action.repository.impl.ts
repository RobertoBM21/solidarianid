import { AbstractTypeormRepository } from '@app/shared/infrastructure/persistence/abstract-typeorm.repository';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { FundingAction } from '../../../domain/aggregates/action.aggregate';
import {
  FundingActionNotFoundError,
  FundingActionRepository,
} from '../../../domain/repositories/funding-action.repository';
import { FundingActionDbEntity } from '../entities/funding-action.db-entity';

@Injectable()
export class FundingActionRepositoryImpl
  extends AbstractTypeormRepository<
    FundingAction,
    FundingActionNotFoundError,
    FundingActionDbEntity
  >
  implements FundingActionRepository
{
  protected readonly dbEntityClass = FundingActionDbEntity;
  protected readonly notFoundErrorClass = FundingActionNotFoundError;

  constructor(protected readonly em: EntityManager) {
    super(em);
  }

  protected mapFromDomain(item: FundingAction): FundingActionDbEntity {
    const entity = new FundingActionDbEntity();
    entity.id = item.id.toString();
    entity.causeId = item.causeId.toString();
    entity.title = item.title;
    entity.description = item.description;
    entity.objectives = [...item.objectives];
    entity.closed = item.closed;
    entity.createdAt = item.createdAt;
    entity.targetAmount = item.targetAmountValue;
    entity.currentAmount = item.currentAmountValue;
    return entity;
  }

  protected mapToDomain(entity: FundingActionDbEntity): FundingAction {
    const fundingActionOrError = FundingAction.create(
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
    if (fundingActionOrError.isLeft()) {
      throw new Error(
        `Error mapping FundingAction DB entity to domain: ${fundingActionOrError.value.message}`,
      );
    }
    return fundingActionOrError.value;
  }
}
