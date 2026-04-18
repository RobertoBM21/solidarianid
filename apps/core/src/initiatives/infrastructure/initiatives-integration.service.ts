import { Either, UniqueEntityID, left } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { DonationIntentionDto } from '../application/dtos/donation-intention.dto';
import {
  DonationIntentionCreationError,
  DonationIntention,
} from '../domain/entities/donation-intention.entity';
import { ActionNotFoundError } from '../domain/repositories/action.repository';
import { FundingActionRepository } from '../domain/repositories/funding-action.repository';
import { InitiativesStatisticsPort } from '../domain/ports/initiatives-statistics.port';

@Injectable()
export class InitiativesIntegrationService {
  constructor(
    private readonly repository: FundingActionRepository,
    private readonly statisticsPort: InitiativesStatisticsPort,
  ) {}

  async requestDonation(
    data: DonationIntentionDto,
  ): Promise<
    Either<
      ActionNotFoundError | DonationIntentionCreationError,
      DonationIntention
    >
  > {
    const actionId = UniqueEntityID.create(data.fundingActionId);
    const actionOrError = await this.repository.findById(actionId);
    if (actionOrError.isLeft()) {
      return left(actionOrError.value);
    }

    return actionOrError.value.requestDonation(data.amount, data.donorId);
  }

  async getMySupports(userId: string) {
    return await this.statisticsPort.getMySupports(userId);
  }
}
