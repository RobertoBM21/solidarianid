import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { UserProposalOutDto } from '../../application/dtos/user-proposal-out.dto';
import { UserProposalsPort } from '../../application/ports/user-proposals.port';
import { CommunityProposalDbEntity } from './entities/community-proposal.db-entity';

@Injectable()
export class UserProposalsAdapter implements UserProposalsPort {
  constructor(private readonly em: EntityManager) {}

  async listUserProposals(userId: string): Promise<UserProposalOutDto[]> {
    const proposals = await this.em.find(CommunityProposalDbEntity, {
      where: { requesterId: userId },
      order: { createdAt: 'DESC' },
    });

    return proposals.map((p) => {
      const dto = new UserProposalOutDto();
      dto.id = p.id;
      dto.name = p.name;
      dto.description = p.description;
      dto.status =
        p.accepted === null ? 'pending' : p.accepted ? 'accepted' : 'rejected';
      dto.createdAt = p.createdAt.toISOString();
      return dto;
    });
  }
}
