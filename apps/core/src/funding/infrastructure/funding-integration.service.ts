import {
  UserDonationHistoryItem,
  UserDonationHistoryItemDto,
} from '@app/shared/application/dtos/my-collaborations.dto';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DonationDbEntity } from './persistence/entities/donation.db-entity';
import { FundingActionAggrDbEntity } from './persistence/entities/funding-action-aggr.db-entity';

@Injectable()
export class FundingIntegrationService {
  constructor(private readonly entityManager: EntityManager) {}

  async getUserDonations(userId: string): Promise<UserDonationHistoryItem[]> {
    const donations = await this.entityManager
      .createQueryBuilder(DonationDbEntity, 'donation')
      .innerJoin(
        FundingActionAggrDbEntity,
        'action',
        'action.id = donation.action_id',
      )
      .select([
        'donation.amount AS amount',
        'donation.created_at AS "createdAt"',
        'action.title AS title',
        'action.cause_id AS "causeId"',
      ])
      .where('donation.user_id = :userId', { userId })
      .getRawMany<{
        amount: string;
        createdAt: Date;
        title: string;
        causeId: string;
      }>();
    return donations.map(
      (row) =>
        new UserDonationHistoryItemDto(
          row.title,
          row.causeId,
          row.createdAt,
          parseFloat(row.amount),
        ),
    );
  }
}
