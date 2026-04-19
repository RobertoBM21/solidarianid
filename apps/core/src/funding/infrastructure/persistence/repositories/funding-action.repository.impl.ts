import { AbstractTypeormRepository } from '@app/shared/infrastructure/persistence/abstract-typeorm.repository';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { FundingAction } from '../../../domain/aggregates/funding-action.aggregate';
import {
  FundingActionNotFoundError,
  FundingActionRepository,
} from '../../../domain/repositories/funding-action.repository';
import { FundingActionAggrDbEntity } from '../entities/funding-action-aggr.db-entity';

@Injectable()
export class FundingActionRepositoryImpl
  extends AbstractTypeormRepository<
    FundingAction,
    FundingActionNotFoundError,
    FundingActionAggrDbEntity
  >
  implements FundingActionRepository
{
  protected readonly dbEntityClass = FundingActionAggrDbEntity;
  protected readonly notFoundErrorClass = FundingActionNotFoundError;

  constructor(protected readonly em: EntityManager) {
    super(em);
  }

  async findAllByCauseId(causeId: string): Promise<FundingAction[]> {
    const entities = await this.em.find(FundingActionAggrDbEntity, {
      where: { causeId },
    });
    return entities.map((entity) => this.mapToDomain(entity));
  }

  protected mapFromDomain(item: FundingAction): FundingActionAggrDbEntity {
    const entity = new FundingActionAggrDbEntity();
    entity.id = item.id.toString();
    entity.causeId = item.causeId.toString();
    entity.title = item.title;
    entity.closed = item.closed;
    entity.currentAmount = item.currentAmountValue;
    return entity;
  }

  protected mapToDomain(entity: FundingActionAggrDbEntity): FundingAction {
    const fundingActionOrError = FundingAction.create(
      {
        title: entity.title,
        closed: entity.closed,
        causeId: entity.causeId,
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
