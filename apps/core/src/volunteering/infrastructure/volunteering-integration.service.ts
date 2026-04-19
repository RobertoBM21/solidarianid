import {
  UserVolunteeringHistoryItem,
  UserVolunteeringHistoryItemDto,
} from '@app/shared/application/dtos/my-collaborations.dto';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { VolunteerLogDbEntity } from './persistence/entities/volunteer-log.db-entity';
import { VolunteeringActionAggrDbEntity } from './persistence/entities/volunteering-action-aggr.db-entity';

@Injectable()
export class VolunteeringIntegrationService {
  constructor(private readonly entityManager: EntityManager) {}

  async getUserVolunteering(
    userId: string,
  ): Promise<UserVolunteeringHistoryItem[]> {
    const logs = await this.entityManager
      .createQueryBuilder(VolunteerLogDbEntity, 'log')
      .innerJoin(
        VolunteeringActionAggrDbEntity,
        'action',
        'action.id = log.action_id',
      )
      .select([
        'log.start AS start',
        'log."end" AS "end"',
        'action.title AS title',
        'action.cause_id AS "causeId"',
      ])
      .where('log.user_id = :userId', { userId })
      .getRawMany<{
        start: Date;
        end: Date;
        title: string;
        causeId: string;
      }>();
    return logs.map(
      (row) =>
        new UserVolunteeringHistoryItemDto(
          row.title,
          row.causeId,
          row.start,
          row.end,
        ),
    );
  }
}
