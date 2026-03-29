import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CommunityMember } from '../../../domain/community-member.aggregate';
import {
  CommunityMemberNotFoundError,
  CommunityMemberRepository,
} from '../../../domain/repositories/community-member.repository';
import { CommunityMemberDbEntity } from '../entities/community-member.db-entity';

@Injectable()
export class CommunityMemberRepositoryImpl extends CommunityMemberRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  async save(member: CommunityMember): Promise<void> {
    const dbEntity = new CommunityMemberDbEntity();
    dbEntity.id = member.id.toString();
    dbEntity.communityId = member.communityId.toString();
    dbEntity.userId = member.userId.toString();
    dbEntity.admin = member.role.asBoolean();
    dbEntity.createdAt = member.createdAt;

    await this.em.save(CommunityMemberDbEntity, dbEntity);
  }

  async findById(
    id: UniqueEntityID,
  ): Promise<Either<CommunityMemberNotFoundError, CommunityMember>> {
    const dbEntity = await this.em.findOne(CommunityMemberDbEntity, {
      where: { id: id.toString() },
    });
    if (!dbEntity) {
      return left(new CommunityMemberNotFoundError(id.toString()));
    }
    return right(this.mapToDomain(dbEntity));
  }

  async remove(
    id: UniqueEntityID,
  ): Promise<Either<CommunityMemberNotFoundError, void>> {
    const result = await this.em.delete(CommunityMemberDbEntity, {
      id: id.toString(),
    });
    if (result.affected === 0) {
      return left(new CommunityMemberNotFoundError(id.toString()));
    }
    return right(undefined);
  }

  async findByCommunityId(
    communityId: UniqueEntityID,
  ): Promise<CommunityMember[]> {
    const entities = await this.em.find(CommunityMemberDbEntity, {
      where: { communityId: communityId.toString() },
    });
    return entities.map((e) => this.mapToDomain(e));
  }

  async findByCommunityIdAndUserId(
    communityId: UniqueEntityID,
    userId: UniqueEntityID,
  ): Promise<Either<CommunityMemberNotFoundError, CommunityMember>> {
    const dbEntity = await this.em.findOne(CommunityMemberDbEntity, {
      where: {
        communityId: communityId.toString(),
        userId: userId.toString(),
      },
    });
    if (!dbEntity) {
      return left(new CommunityMemberNotFoundError(userId.toString()));
    }
    return right(this.mapToDomain(dbEntity));
  }

  async listByUserIds(userIds: string[]): Promise<Map<string, string[]>> {
    if (userIds.length === 0) {
      return new Map<string, string[]>();
    }

    const rawResults = await this.em
      .createQueryBuilder(CommunityMemberDbEntity, 'm')
      .innerJoin('m.community', 'community')
      .select('m.userId', 'member_user_id')
      .addSelect('community.name', 'community_name')
      .where('m.userId IN (:...userIds)', { userIds })
      .getRawMany<{ member_user_id: string; community_name: string }>();

    const communityNamesPerUser = new Map<string, string[]>();
    for (const result of rawResults) {
      const userId = result.member_user_id;
      const communityName = result.community_name;
      if (!communityNamesPerUser.has(userId)) {
        communityNamesPerUser.set(userId, []);
      }
      communityNamesPerUser.get(userId)?.push(communityName);
    }
    return communityNamesPerUser;
  }

  private mapToDomain(entity: CommunityMemberDbEntity): CommunityMember {
    const communityMemberOrError = CommunityMember.create(
      {
        communityId: entity.communityId,
        userId: entity.userId,
        admin: entity.admin,
        createdAt: entity.createdAt,
      },
      entity.id,
    );
    if (communityMemberOrError.isLeft()) {
      throw new Error(
        `Error mapping CommunityMemberDbEntity to CommunityMember: ${communityMemberOrError.value.message}`,
      );
    }
    return communityMemberOrError.value;
  }
}
