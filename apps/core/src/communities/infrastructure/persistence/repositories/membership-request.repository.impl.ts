import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { EntityManager, IsNull } from 'typeorm';
import { MembershipRequest } from '../../../domain/membership-request.aggregate';
import {
  MembershipRequestNotFoundError,
  MembershipRequestRepository,
} from '../../../domain/repositories/membership-request.repository';
import { MembershipRequestDbEntity } from '../entities/membership-request.db-entity';

@Injectable()
export class MembershipRequestRepositoryImpl extends MembershipRequestRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  async save(request: MembershipRequest): Promise<void> {
    const dbEntity = new MembershipRequestDbEntity();
    dbEntity.id = request.id.toString();
    dbEntity.communityId = request.communityId.toString();
    dbEntity.userId = request.userId.toString();
    dbEntity.accepted = request.accepted;
    dbEntity.createdAt = request.createdAt;

    await this.em.save(MembershipRequestDbEntity, dbEntity);
  }

  async findById(
    id: UniqueEntityID,
  ): Promise<Either<MembershipRequestNotFoundError, MembershipRequest>> {
    const dbEntity = await this.em.findOne(MembershipRequestDbEntity, {
      where: { id: id.toString() },
    });
    if (!dbEntity) {
      return left(new MembershipRequestNotFoundError(id.toString()));
    }
    return right(this.mapToDomain(dbEntity));
  }

  async findPendingByCommunityId(
    communityId: UniqueEntityID,
  ): Promise<MembershipRequest[]> {
    const dbEntities = await this.em.find(MembershipRequestDbEntity, {
      where: {
        communityId: communityId.toString(),
        accepted: IsNull(),
      },
    });

    return dbEntities.map((e) => this.mapToDomain(e));
  }

  async findByUserId(userId: UniqueEntityID): Promise<MembershipRequest[]> {
    const dbEntities = await this.em.find(MembershipRequestDbEntity, {
      where: {
        userId: userId.toString(),
      },
    });

    return dbEntities.map((e) => this.mapToDomain(e));
  }

  async findByUserAndCommunity(
    userId: UniqueEntityID,
    communityId: UniqueEntityID,
  ): Promise<Either<MembershipRequestNotFoundError, MembershipRequest>> {
    const dbEntity = await this.em.findOne(MembershipRequestDbEntity, {
      where: {
        userId: userId.toString(),
        communityId: communityId.toString(),
      },
    });

    if (!dbEntity) {
      return left(
        new MembershipRequestNotFoundError(
          `${userId.toString()} in ${communityId.toString()}`,
        ),
      );
    }
    return right(this.mapToDomain(dbEntity));
  }

  async remove(
    id: UniqueEntityID,
  ): Promise<Either<MembershipRequestNotFoundError, void>> {
    const result = await this.em.delete(MembershipRequestDbEntity, {
      id: id.toString(),
    });
    if (result.affected === 0) {
      return left(new MembershipRequestNotFoundError(id.toString()));
    }
    return right(undefined);
  }

  private mapToDomain(entity: MembershipRequestDbEntity): MembershipRequest {
    const output = MembershipRequest.create(
      {
        communityId: entity.communityId,
        userId: entity.userId,
        accepted: entity.accepted,
        createdAt: entity.createdAt,
      },
      entity.id,
    );
    if (output.isLeft()) {
      throw new Error(
        `Error mapping MembershipRequestDbEntity to domain: ${output.value.message}`,
      );
    }
    return output.value;
  }
}
