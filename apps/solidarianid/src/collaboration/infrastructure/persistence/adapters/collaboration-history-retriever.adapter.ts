import { UserVolunteeringHistoryItem } from '@app/shared/domain/queries/get-my-collaborations.query';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
  UserDonationHistoryItemDto,
  UserVolunteeringHistoryItemDto,
} from '../../../application/dtos/my-collaborations.dto';
import { CollaborationHistoryRetrieverPort } from '../../../domain/ports/collaboration-history-retriever.port';
import { DonationDbEntity } from '../entities/donation.db-entity';
import { VolunteerLogDbEntity } from '../entities/volunteer-log.db-entity';

@Injectable()
export class CollaborationHistoryRetrieverAdapter implements CollaborationHistoryRetrieverPort {
  constructor(private readonly entityManager: EntityManager) {}

  async getUserDonations(
    userId: string,
  ): Promise<UserDonationHistoryItemDto[]> {
    const donations = await this.entityManager.find(DonationDbEntity, {
      where: { userId },
      relations: { action: true },
      select: {
        action: {
          title: true,
          causeId: true,
        },
        amount: true,
        createdAt: true,
      },
    });
    return donations.map(
      (donation) =>
        new UserDonationHistoryItemDto(
          donation.action.title,
          donation.action.causeId,
          donation.createdAt,
          donation.amount,
        ),
    );
  }

  async getUserVolunteering(
    userId: string,
  ): Promise<UserVolunteeringHistoryItem[]> {
    const volunteerLogs = await this.entityManager.find(VolunteerLogDbEntity, {
      where: { userId },
      relations: { action: true },
      select: {
        action: {
          title: true,
          causeId: true,
        },
        start: true,
        end: true,
      },
    });
    return volunteerLogs.map(
      (log) =>
        new UserVolunteeringHistoryItemDto(
          log.action.title,
          log.action.causeId,
          log.start,
          log.end,
        ),
    );
  }
}
