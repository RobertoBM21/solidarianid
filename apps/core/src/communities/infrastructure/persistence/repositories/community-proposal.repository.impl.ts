import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import { CommunityProposal } from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
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
    const proposalOrError = CommunityProposal.create(
      {
        name: dbEntity.name,
        description: dbEntity.description,
        requesterId: dbEntity.requesterId,
        accepted: dbEntity.accepted,
        createdAt: dbEntity.createdAt,
      },
      dbEntity.id,
    );
    if (proposalOrError.isLeft()) {
      throw new Error(
        `Error mapping CommunityProposalDbEntity to domain: ${proposalOrError.value.message}`,
      );
    }
    return right(proposalOrError.value);
  }

  async remove(
    id: UniqueEntityID,
  ): Promise<Either<CommunityProposalNotFoundError, void>> {
    const result = await this.em.delete(CommunityProposalDbEntity, {
      id: id.toString(),
    });
    if (result.affected === 0) {
      return left(new CommunityProposalNotFoundError(id.toString()));
    }
    return right(undefined);
  }

  async updateAcceptedStatus(
    proposalId: string,
    accepted: boolean,
  ): Promise<void> {
    await this.em.update(CommunityProposalDbEntity, proposalId, { accepted });
  }
}
