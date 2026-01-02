import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Community } from '../../domain/aggregates/community.aggregate';
import {
  CommunitiesRepository,
  CommunityNotFoundError,
} from '../../domain/repositories/communities.repository';
import { CommunityDbEntity } from './entities/community.db-entity';

@Injectable()
export class CommunitiesRepositoryImpl extends CommunitiesRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  async save(community: Community): Promise<void> {
    const dbEntity = new CommunityDbEntity();
    dbEntity.id = community.id.toString();
    dbEntity.name = community.name;
    dbEntity.description = community.description;
    dbEntity.createdAt = community.createdAt;

    await this.em.save(CommunityDbEntity, dbEntity);
  }

  async findById(
    id: UniqueEntityID,
  ): Promise<Either<CommunityNotFoundError, Community>> {
    const dbEntity = await this.em.findOne(CommunityDbEntity, {
      where: { id: id.toString() },
    });
    if (!dbEntity) {
      return left(new CommunityNotFoundError(id.toString()));
    }
    return right(this.mapCommunityToDomain(dbEntity));
  }

  async findAll(): Promise<Community[]> {
    const dbEntities = await this.em.find(CommunityDbEntity, {
      order: { createdAt: 'DESC' },
    });
    return dbEntities.map((com) => this.mapCommunityToDomain(com));
  }

  private mapCommunityToDomain(entity: CommunityDbEntity): Community {
    const obj = Community.create(
      {
        name: entity.name,
        description: entity.description,
        createdAt: entity.createdAt,
        admins: [], // TODO: Load admins from DB
      },
      entity.id,
    );
    if (obj.isLeft()) {
      // This should never happen, as data is coming from the DB
      throw new Error(
        `Error mapping CommunityDbEntity to Community aggregate: ${obj.value.message}`,
      );
    }
    return obj.value;
  }

  async remove(
    id: UniqueEntityID,
  ): Promise<Either<CommunityNotFoundError, void>> {
    await this.em.delete(CommunityDbEntity, { id: id.toString() });
    return right(undefined);
  }
}
