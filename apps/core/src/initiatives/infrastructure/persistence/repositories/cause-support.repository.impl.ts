import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CauseSupport } from '../../../domain/aggregates/cause-support.aggregate';
import {
  CauseSupportNotFoundError,
  CauseSupportRepository,
} from '../../../domain/repositories/cause-support.repository';
import {
  AnonymousSupporter,
  Supporter,
  UserSupporter,
} from '../../../domain/value-objects/supporter.vo';
import { CauseSupportDbEntity } from '../entities/cause-support.db-entity';

@Injectable()
export class CauseSupportRepositoryImpl extends CauseSupportRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  async save(support: CauseSupport): Promise<void> {
    const supporter = support.supporter;
    const entity = new CauseSupportDbEntity();
    entity.id = support.id.toString();
    entity.causeId = support.causeId.toString();
    entity.userId =
      supporter instanceof UserSupporter ? supporter.id.toString() : null;
    entity.anonymousUserId =
      supporter instanceof AnonymousSupporter ? supporter.id.toString() : null;
    entity.createdAt = support.date;

    await this.em.save(CauseSupportDbEntity, entity);
  }

  async findById(
    id: UniqueEntityID,
  ): Promise<Either<CauseSupportNotFoundError, CauseSupport>> {
    const entity = await this.em.findOne(CauseSupportDbEntity, {
      where: { id: id.toString() },
    });
    if (!entity) {
      return left(new CauseSupportNotFoundError());
    }
    return right(this.mapToDomain(entity));
  }

  async remove(
    id: UniqueEntityID,
  ): Promise<Either<CauseSupportNotFoundError, void>> {
    const result = await this.em.delete(CauseSupportDbEntity, {
      id: id.toString(),
    });
    if (!result.affected) {
      return left(new CauseSupportNotFoundError());
    }
    return right(undefined);
  }

  async findBySupporterAndCause(
    supporter: Supporter,
    causeId: UniqueEntityID,
  ): Promise<Either<CauseSupportNotFoundError, CauseSupport>> {
    const where = this.buildWhereForSupporterAndCause(supporter, causeId);
    const entity = await this.em.findOne(CauseSupportDbEntity, { where });
    if (!entity) {
      return left(new CauseSupportNotFoundError());
    }
    return right(this.mapToDomain(entity));
  }

  existsForSupporterAndCause(
    supporter: Supporter,
    causeId: UniqueEntityID,
  ): Promise<boolean> {
    const where = this.buildWhereForSupporterAndCause(supporter, causeId);
    return this.em.exists(CauseSupportDbEntity, { where });
  }

  async removeByUserAndCause(
    userId: UniqueEntityID,
    causeId: UniqueEntityID,
  ): Promise<Either<CauseSupportNotFoundError, void>> {
    const result = await this.em.delete(CauseSupportDbEntity, {
      where: {
        causeId: causeId.toString(),
        userId: userId.toString(),
      },
    });
    if (!result.affected) {
      return left(new CauseSupportNotFoundError());
    }
    return right(undefined);
  }

  private mapToDomain(entity: CauseSupportDbEntity): CauseSupport {
    let supporter: Supporter;
    if (entity.userId) {
      supporter = UserSupporter.create(UniqueEntityID.create(entity.userId));
    } else if (entity.anonymousUserId) {
      supporter = AnonymousSupporter.create(
        UniqueEntityID.create(entity.anonymousUserId),
      );
    } else {
      throw new Error(
        `Invalid cause support entity data for ID ${entity.id}: missing supporter identifiers`,
      );
    }

    const supportOrError = CauseSupport.create(
      {
        causeId: entity.causeId,
        supporter,
        date: entity.createdAt,
      },
      entity.id,
    );
    if (supportOrError.isLeft()) {
      throw new Error(
        `Invalid cause support entity data for ID ${entity.id}: ${supportOrError.value.message}`,
      );
    }
    return supportOrError.value;
  }

  private buildWhereForSupporterAndCause(
    supporter: Supporter,
    causeId: UniqueEntityID,
  ): {
    causeId: string;
    userId?: string;
    anonymousUserId?: string;
  } {
    if (supporter instanceof UserSupporter) {
      return {
        causeId: causeId.toString(),
        userId: supporter.id.toString(),
      };
    }

    return {
      causeId: causeId.toString(),
      anonymousUserId: supporter.id.toString(),
    };
  }
}
