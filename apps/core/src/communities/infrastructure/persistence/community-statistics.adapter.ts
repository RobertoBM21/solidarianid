import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
  CommunityStatisticsPort,
  CommunityStatisticsRow,
} from '../../application/ports/community-statistics.port';
import { CommunityMemberDbEntity } from './entities/community-member.db-entity';
import { CommunityDbEntity } from './entities/community.db-entity';

@Injectable()
export class CommunityStatisticsAdapter implements CommunityStatisticsPort {
  constructor(private readonly entityManager: EntityManager) {}

  async getCommunitiesStatistics(): Promise<CommunityStatisticsRow[]> {
    const rows = await this.entityManager
      .getRepository(CommunityDbEntity)
      .createQueryBuilder('c')
      .leftJoin(CommunityMemberDbEntity, 'm', 'm.community_id = c.id')
      .select('c.id', 'community_id')
      .addSelect('c.name', 'community_name')
      .addSelect(
        'COUNT(DISTINCT m.user_id) FILTER (WHERE m.admin = false)',
        'users',
      )
      .addSelect(
        'COUNT(DISTINCT m.user_id) FILTER (WHERE m.admin = true)',
        'admins',
      )
      .groupBy('c.id')
      .addGroupBy('c.name')
      .getRawMany<{
        community_id: string;
        community_name: string;
        users: string;
        admins: string;
      }>();

    return rows.map((row) => ({
      id: row.community_id,
      name: row.community_name,
      users: parseInt(row.users, 10),
      admins: parseInt(row.admins, 10),
    }));
  }
}
