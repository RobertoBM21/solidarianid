import {
  CauseStatisticsRow,
  CommunityActivityRow,
} from '@app/shared/domain/queries/get-initiatives-statistics.query';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InitiativesStatisticsPort } from '../../domain/ports/initiatives-statistics.port';
import { CauseSupportDbEntity } from './entities/cause-support.db-entity';
import { CauseDbEntity } from './entities/cause.db-entity';

@Injectable()
export class InitiativesStatisticsAdapter implements InitiativesStatisticsPort {
  constructor(private readonly dataSource: DataSource) {}

  async getActivityData(): Promise<CommunityActivityRow[]> {
    const result = await this.dataSource
      .getRepository(CauseDbEntity)
      .createQueryBuilder('cause')
      .select('EXTRACT(MONTH FROM cause.created_at)', 'month')
      .addSelect('EXTRACT(YEAR FROM cause.created_at)', 'year')
      .addSelect('cause.communityId', 'community_id')
      .addSelect('COUNT(cause.id)', 'new_causes')
      .where("cause.created_at > NOW() - INTERVAL '6 months'")
      .groupBy('month')
      .addGroupBy('year')
      .addGroupBy('cause.communityId')
      .orderBy('year', 'ASC')
      .addOrderBy('month', 'ASC')
      .getRawMany<{
        month: string;
        year: string;
        community_id: string;
        new_causes: string;
      }>();

    return result.map((row) => ({
      month: parseInt(row.month, 10),
      year: parseInt(row.year, 10),
      communityId: row.community_id,
      newCauses: parseInt(row.new_causes, 10),
    }));
  }

  async getCauseStatistics(): Promise<CauseStatisticsRow[]> {
    const supportsCteQuery = this.dataSource
      .createQueryBuilder()
      .select('cau.community_id', 'community_id')
      .addSelect('COUNT(casup.id)', 'total_supports')
      .from('cause_supports', 'casup')
      .innerJoin('causes', 'cau', 'casup.cause_id = cau.id')
      .groupBy('cau.community_id');

    const stats = await this.dataSource
      .getRepository(CauseDbEntity)
      .createQueryBuilder('ca')

      .addCommonTableExpression(supportsCteQuery, 'supports_cte')

      .leftJoin('supports_cte', 's', 'ca.community_id = s.community_id')

      .select('ca.community_id', 'community_id')
      .addSelect(
        'COUNT(DISTINCT ca.id) FILTER (WHERE ca.closed = false)',
        'active_causes',
      )
      .addSelect(
        'COUNT(DISTINCT ca.id) FILTER (WHERE ca.closed = true)',
        'closed_causes',
      )
      .addSelect('COUNT(DISTINCT ca.ods)', 'ods_covered')
      .addSelect('COALESCE(s.total_supports, 0)', 'supports')

      .groupBy('ca.community_id')
      .addGroupBy('s.total_supports')

      .getRawMany<{
        community_id: string;
        active_causes: string;
        closed_causes: string;
        ods_covered: string;
        supports: string;
      }>();

    return stats.map((row) => ({
      communityId: row.community_id,
      activeCauses: parseInt(row.active_causes, 10),
      closedCauses: parseInt(row.closed_causes, 10),
      odsCovered: parseInt(row.ods_covered, 10),
      supports: parseInt(row.supports, 10),
    }));
  }

  async getOdsCounts(): Promise<{ ods: number; count: number }[]> {
    const result = await this.dataSource
      .getRepository(CauseDbEntity)
      .createQueryBuilder('cause')
      .select('cause.ods', 'ods_id')
      .addSelect('COUNT(*)', 'count')
      .groupBy('cause.ods')
      .orderBy('count', 'DESC')
      .getRawMany<{
        ods_id: string;
        count: string;
      }>();

    return result.map((row) => ({
      ods: parseInt(row.ods_id, 10),
      count: parseInt(row.count, 10),
    }));
  }

  getTotalCausesCount(): Promise<number> {
    return this.dataSource.getRepository(CauseDbEntity).count();
  }

  getTotalSupportsCount(): Promise<number> {
    return this.dataSource.getRepository(CauseSupportDbEntity).count();
  }
}
