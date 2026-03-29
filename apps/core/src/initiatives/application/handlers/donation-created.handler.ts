import { UniqueEntityID } from '@app/shared/domain';
import { Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';
import { DonationCreated } from '../../../collaboration/domain/events/donation-created.event';
import { FundingActionRepository } from '../../domain/repositories/funding-action.repository';

@EventsHandler(DonationCreated)
export class DonationCreatedHandler {
  private readonly logger = new Logger(DonationCreatedHandler.name);

  constructor(
    private readonly fundingActionRepository: FundingActionRepository,
  ) {}

  async handle(event: DonationCreated): Promise<void> {
    const fundingActionOrError = await this.fundingActionRepository.findById(
      UniqueEntityID.create(event.fundingActionId),
    );
    if (fundingActionOrError.isLeft()) {
      this.logger.error(`Funding action not found: ${event.fundingActionId}`);
      return;
    }

    const fundingAction = fundingActionOrError.value;
    const result = fundingAction.incrementTotalDonations(event.amount);
    if (result.isLeft()) {
      this.logger.error(
        `Failed to increment total donations of ${event.fundingActionId}: ${result.value.message}`,
      );
      return;
    }
    await this.fundingActionRepository.save(fundingAction);
  }
}
