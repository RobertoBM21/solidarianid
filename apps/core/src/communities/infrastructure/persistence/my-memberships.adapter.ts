import { UserMembershipHistoryItem } from '@app/shared/domain/queries/get-my-collaborations.query';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { MyMembershipsPort } from '../../application/ports/my-memberships.port';
import { CommunityMemberDbEntity } from './entities/community-member.db-entity';

@Injectable()
export class MyMembershipsAdapter implements MyMembershipsPort {
  constructor(private readonly entityManager: EntityManager) {}

  async getUserMemberships(
    userId: string,
  ): Promise<UserMembershipHistoryItem[]> {
    const entities = await this.entityManager.find(CommunityMemberDbEntity, {
      where: { userId },
      relations: {
        community: true,
      },
      select: {
        community: { name: true },
        createdAt: true,
      },
    });

    return entities.map((entity) => ({
      type: 'membership',
      subject: entity.community.name,
      date: entity.createdAt.toISOString(),
    }));
  }
}
