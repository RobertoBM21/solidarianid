import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { ok } from 'assert';
import { EntityManager, ILike, In } from 'typeorm';
import { Community } from '../../../domain/community.aggregate';
import { Cause } from '../../../domain/entities/cause.entity';
import {
  CommunityNotFoundError,
  CommunityRepository,
} from '../../../domain/repositories/community.repository';
import { CauseDbEntity } from '../entities/cause.db-entity';
import { CommunityMemberDbEntity } from '../entities/community-member.db-entity';
import { CommunityDbEntity } from '../entities/community.db-entity';

@Injectable()
export class CommunityRepositoryImpl extends CommunityRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  async existsByName(name: string): Promise<boolean> {
    return await this.em.exists(CommunityDbEntity, {
      where: { name },
    });
  }

  async save(community: Community): Promise<void> {
    const dbEntity = new CommunityDbEntity();
    dbEntity.id = community.id.toString();
    dbEntity.name = community.name;
    dbEntity.description = community.description;
    dbEntity.createdAt = community.createdAt;

    dbEntity.causes = community.causes.map((cause) => {
      const causeEntity = new CauseDbEntity();
      causeEntity.id = cause.id.toString();
      causeEntity.community = dbEntity;
      causeEntity.communityId = community.id.toString();
      causeEntity.title = cause.title;
      causeEntity.description = cause.description;
      causeEntity.duration = cause.duration;
      causeEntity.ods = cause.ods;
      causeEntity.closed = cause.closed;
      causeEntity.createdAt = cause.createdAt;
      return causeEntity;
    });

    await this.em.transaction(async (manager) => {
      await manager.save(CommunityDbEntity, dbEntity);

      const admins = community.admins.value;
      await manager.upsert(
        CommunityMemberDbEntity,
        admins.map((adminId) => ({
          id: UniqueEntityID.create().toString(),
          communityId: community.id.toString(),
          userId: adminId.toString(),
          admin: true,
          createdAt: new Date(),
        })),
        {
          conflictPaths: ['communityId', 'userId'],
          skipUpdateIfNoValuesChanged: true,
        },
      );
    });
  }

  async findById(
    id: UniqueEntityID,
  ): Promise<Either<CommunityNotFoundError, Community>> {
    const dbEntity = await this.em.findOne(CommunityDbEntity, {
      where: { id: id.toString() },
      relations: { causes: true },
    });
    if (!dbEntity) {
      return left(new CommunityNotFoundError(id.toString()));
    }
    return right(await this.mapCommunityToDomain(dbEntity));
  }

  async findAll(
    search?: string,
    sort?: { field?: 'name' | 'createdAt'; order?: 'ASC' | 'DESC' },
  ): Promise<Community[]> {
    const where = search ? { name: ILike(`%${search}%`) } : undefined;
    const orderField = sort?.field ?? 'createdAt';
    const orderDirection: 'ASC' | 'DESC' = sort?.order ?? 'DESC';

    const dbEntities = await this.em.find(CommunityDbEntity, {
      where,
      order: { [orderField]: orderDirection },
      relations: { causes: true },
    });

    if (!dbEntities.length) {
      return [];
    }

    const ids = dbEntities.map((com) => com.id);
    const [adminMap] = await Promise.all([this.loadAdminIdsByCommunities(ids)]);

    return dbEntities.map((com) =>
      this.mapCommunityToDomainWithData(com, adminMap.get(com.id) ?? []),
    );
  }

  async exists(id: UniqueEntityID): Promise<boolean> {
    const count = await this.em.count(CommunityDbEntity, {
      where: { id: id.toString() },
    });
    return count > 0;
  }

  async isAdmin(
    communityId: UniqueEntityID,
    userId: UniqueEntityID,
  ): Promise<boolean> {
    return this.em.exists(CommunityMemberDbEntity, {
      where: {
        communityId: communityId.toString(),
        userId: userId.toString(),
        admin: true,
      },
    });
  }

  private async mapCommunityToDomain(
    entity: CommunityDbEntity,
  ): Promise<Community> {
    const adminIds = await this.loadAdminIds(entity.id);
    return this.mapCommunityToDomainWithData(entity, adminIds);
  }

  private mapCommunityToDomainWithData(
    entity: CommunityDbEntity,
    adminIds: string[],
  ): Community {
    ok(entity.causes, `Causes should be loaded for community ${entity.id}`);
    const causes = entity.causes.map((causeEntity) => {
      const causeOrError = Cause.create(
        {
          title: causeEntity.title,
          description: causeEntity.description,
          duration: causeEntity.duration,
          ods: causeEntity.ods,
          closed: causeEntity.closed,
          createdAt: causeEntity.createdAt,
        },
        causeEntity.id,
      );
      if (causeOrError.isLeft()) {
        // This should never happen, as data is coming from the DB
        throw new Error(
          `Error mapping CauseDbEntity to Cause entity: ${causeOrError.value.message}`,
        );
      }
      return causeOrError.value;
    });
    const obj = Community.create(
      {
        name: entity.name,
        description: entity.description,
        createdAt: entity.createdAt,
        admins: adminIds,
        causes,
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

  private async loadAdminIds(communityId: string): Promise<string[]> {
    const members = await this.em.find(CommunityMemberDbEntity, {
      select: { userId: true },
      where: { communityId, admin: true },
    });
    return members.map((member) => member.userId);
  }

  private async loadAdminIdsByCommunities(
    communityIds: string[],
  ): Promise<Map<string, string[]>> {
    const members = await this.em.find(CommunityMemberDbEntity, {
      select: { communityId: true, userId: true },
      where: { communityId: In(communityIds), admin: true },
    });
    const map = new Map<string, string[]>();
    for (const member of members) {
      const list = map.get(member.communityId) ?? [];
      list.push(member.userId);
      map.set(member.communityId, list);
    }
    return map;
  }

  async remove(
    id: UniqueEntityID,
  ): Promise<Either<CommunityNotFoundError, void>> {
    const result = await this.em.delete(CommunityDbEntity, {
      id: id.toString(),
    });
    if (result.affected === 0) {
      return left(new CommunityNotFoundError(id.toString()));
    }
    return right(undefined);
  }
}
