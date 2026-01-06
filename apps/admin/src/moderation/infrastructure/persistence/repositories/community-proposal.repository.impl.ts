import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { CommunityProposal } from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { Injectable } from '@nestjs/common';
import { EntityManager, IsNull } from 'typeorm';
import {
  CommunityProposalNotFoundError,
  CommunityProposalRepository,
} from '../../../domain/repositories/community-proposal.repository';
import { CommunityProposalDbEntity } from '../entities/community-proposal.db-entity';

@Injectable()
export class CommunityProposalRepositoryImpl extends CommunityProposalRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  async save(proposal: CommunityProposal): Promise<void> {
    const dbEntity = new CommunityProposalDbEntity();
    dbEntity.id = proposal.id.toString();
    dbEntity.name = proposal.name;
    dbEntity.description = proposal.description;
    dbEntity.requesterId = proposal.requesterId;
    dbEntity.accepted = proposal.accepted;
    dbEntity.createdAt = proposal.createdAt;

    await this.em.save(CommunityProposalDbEntity, dbEntity);
  }

  async findById(
    id: UniqueEntityID,
  ): Promise<Either<CommunityProposalNotFoundError, CommunityProposal>> {
    const dbEntity = await this.em.findOne(CommunityProposalDbEntity, {
      where: { id: id.toString() },
    });
    if (!dbEntity) {
      return left(new CommunityProposalNotFoundError(id.toString()));
    }
    return right(this.mapCommunityToDomain(dbEntity));
  }

  async findAllPending(): Promise<CommunityProposal[]> {
    const dbEntities = await this.em.find(CommunityProposalDbEntity, {
      where: { accepted: IsNull() },
      order: { createdAt: 'ASC' },
    });
    return dbEntities.map((com) => this.mapCommunityToDomain(com));
  }

  private mapCommunityToDomain(
    entity: CommunityProposalDbEntity,
  ): CommunityProposal {
    const obj = CommunityProposal.create(
      {
        name: entity.name,
        description: entity.description,
        requesterId: entity.requesterId,
        accepted: entity.accepted,
        createdAt: entity.createdAt,
      },
      entity.id,
    );
    if (obj.isLeft()) {
      // Should not happen unless the data in the DB is corrupted
      throw new Error(
        `Error mapping CommunityProposalDbEntity to CommunityProposal aggregate: ${obj.value.message}`,
      );
    }
    return obj.value;
  }

  async remove(
    id: UniqueEntityID,
  ): Promise<Either<CommunityProposalNotFoundError, void>> {
    const res = await this.em.delete(CommunityProposalDbEntity, {
      id: id.toString(),
    });
    if (res.affected === 0) {
      return left(new CommunityProposalNotFoundError(id.toString()));
    }
    return right(undefined);
  }
}
