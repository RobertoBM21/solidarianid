import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Cause } from '../../../domain/aggregates/cause.aggregate';
import {
  CauseNotFoundError,
  CauseRepository,
} from '../../../domain/repositories/cause.repository';
import { CauseDbEntity } from '../entities/cause.db-entity';

@Injectable()
export class CauseRepositoryImpl extends CauseRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  async save(cause: Cause): Promise<void> {
    const entity = new CauseDbEntity();
    entity.id = cause.id.toString();
    entity.communityId = cause.communityId.toString();
    entity.title = cause.title;
    entity.description = cause.description;
    entity.duration = cause.duration;
    entity.ods = cause.ods;
    entity.closed = cause.closed;
    entity.createdAt = cause.createdAt;

    await this.em.save(CauseDbEntity, entity);
  }

  async findById(
    id: UniqueEntityID,
  ): Promise<Either<CauseNotFoundError, Cause>> {
    const entity = await this.em.findOne(CauseDbEntity, {
      where: { id: id.toString() },
    });
    if (!entity) {
      return left(new CauseNotFoundError(id.toString()));
    }
    return right(this.mapToDomain(entity));
  }

  async listByCommunity(communityId: UniqueEntityID): Promise<Cause[]> {
    const entities = await this.em.find(CauseDbEntity, {
      where: { communityId: communityId.toString() },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.mapToDomain(entity));
  }

  async remove(id: UniqueEntityID): Promise<Either<CauseNotFoundError, void>> {
    const result = await this.em.delete(CauseDbEntity, { id: id.toString() });
    if (result.affected === 0) {
      return left(new CauseNotFoundError(id.toString()));
    }
    return right(undefined);
  }

  async findByIdAndCommunity(
    causeId: UniqueEntityID,
    communityId: UniqueEntityID,
  ): Promise<Either<CauseNotFoundError, Cause>> {
    const entity = await this.em.findOneBy(CauseDbEntity, {
      id: causeId.toString(),
      communityId: communityId.toString(),
    });
    if (!entity) {
      return left(new CauseNotFoundError(causeId.toString()));
    }
    return right(this.mapToDomain(entity));
  }

  private mapToDomain(entity: CauseDbEntity): Cause {
    const causeOrError = Cause.create(
      {
        title: entity.title,
        description: entity.description,
        duration: entity.duration,
        ods: entity.ods,
        closed: entity.closed,
        createdAt: entity.createdAt,
        communityId: entity.communityId,
      },
      entity.id,
    );
    if (causeOrError.isLeft()) {
      throw new Error(
        `Invalid cause entity data for ID ${entity.id}: ${causeOrError.value.message}`,
      );
    }
    return causeOrError.value;
  }
}
