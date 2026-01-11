import { UniqueEntityID } from '@app/shared/domain';
import { AbstractTypeormRepository } from '@app/shared/infrastructure/persistence/abstract-typeorm.repository';
import { Injectable } from '@nestjs/common';
import { Donation } from '../../../domain/aggregates/donation.aggregate';
import {
  DonationNotFoundError,
  DonationRepository,
} from '../../../domain/repositories/donation.repository';
import { DonationDbEntity } from '../entities/donation.db-entity';

@Injectable()
export class DonationRepositoryImpl
  extends AbstractTypeormRepository<
    Donation,
    DonationNotFoundError,
    DonationDbEntity
  >
  implements DonationRepository
{
  protected readonly dbEntityClass = DonationDbEntity;
  protected readonly notFoundErrorClass = DonationNotFoundError;

  async getTotalDonationsAmount(): Promise<number> {
    const result = await this.em
      .createQueryBuilder(DonationDbEntity, 'donations')
      .select('SUM(donations.amount)', 'total')
      .getRawOne<{ total: string }>();

    return result?.total ? parseFloat(result.total) : 0;
  }

  protected mapFromDomain(item: Donation): DonationDbEntity {
    const entity = new DonationDbEntity();
    entity.id = item.id.toString();
    entity.amount = item.amount;
    entity.userId = item.donorId;
    entity.actionId = item.fundingActionId;
    entity.created_at = item.createdAt;
    return entity;
  }

  protected mapToDomain(entity: DonationDbEntity): Donation {
    const donationOrError = Donation.create(
      {
        donorId: entity.userId,
        fundingActionId: entity.actionId,
        amount: entity.amount,
        date: entity.created_at,
      },
      UniqueEntityID.create(entity.id),
    );
    if (donationOrError.isLeft()) {
      throw new Error(
        `Invalid donation entity data for ID ${entity.id}: ${donationOrError.value.message}`,
      );
    }
    return donationOrError.value;
  }
}
