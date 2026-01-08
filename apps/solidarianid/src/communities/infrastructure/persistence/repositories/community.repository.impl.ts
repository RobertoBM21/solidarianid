import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { EntityManager, ILike, In } from 'typeorm';
import { CauseDbEntity } from '../../../../initiatives/infrastructure/persistence/entities/cause.db-entity';
import { Community } from '../../../domain/community.aggregate';
import {
  CommunityNotFoundError,
  CommunityRepository,
} from '../../../domain/repositories/community.repository';
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
    });

    if (!dbEntities.length) {
      return [];
    }

    const ids = dbEntities.map((com) => com.id);
    const [adminMap, causeMap] = await Promise.all([
      this.loadAdminIdsByCommunities(ids),
      this.loadCauseIdsByCommunities(ids),
    ]);

    return dbEntities.map((com) =>
      this.mapCommunityToDomainWithData(
        com,
        adminMap.get(com.id) ?? [],
        causeMap.get(com.id) ?? [],
      ),
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
    const [adminIds, causeIds] = await Promise.all([
      this.loadAdminIds(entity.id),
      this.loadCauseIds(entity.id),
    ]);

    return this.mapCommunityToDomainWithData(entity, adminIds, causeIds);
  }

  private mapCommunityToDomainWithData(
    entity: CommunityDbEntity,
    adminIds: string[],
    causeIds: string[],
  ): Community {
    const obj = Community.create(
      {
        name: entity.name,
        description: entity.description,
        createdAt: entity.createdAt,
        admins: adminIds,
        causes: causeIds,
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

  private async loadCauseIds(communityId: string): Promise<string[]> {
    const causes = await this.em.find(CauseDbEntity, {
      select: { id: true },
      where: { communityId },
    });
    return causes.map((cause) => cause.id);
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

  private async loadCauseIdsByCommunities(
    communityIds: string[],
  ): Promise<Map<string, string[]>> {
    if (communityIds.length === 0) {
      return new Map();
    }
    const causes = await this.em.find(CauseDbEntity, {
      select: { id: true, communityId: true },
      where: { communityId: In(communityIds) },
    });
    const map = new Map<string, string[]>();
    for (const cause of causes) {
      const list = map.get(cause.communityId) ?? [];
      list.push(cause.id);
      map.set(cause.communityId, list);
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
