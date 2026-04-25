import { Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';
import { FundingActionCreatedEvent } from '../../../initiatives/domain/events/funding-action-created.event';
import { FundingAction } from '../../domain/aggregates/funding-action.aggregate';
import { FundingActionRepository } from '../../domain/repositories/funding-action.repository';

@EventsHandler(FundingActionCreatedEvent)
export class FundingActionCreatedHandler {
  private readonly logger = new Logger(FundingActionCreatedHandler.name);

  constructor(
    private readonly fundingActionRepository: FundingActionRepository,
  ) {}

  async handle(event: FundingActionCreatedEvent): Promise<void> {
    const actionOrError = FundingAction.create(
      {
        title: event.title,
        causeId: event.causeId,
      },
      event.actionId,
    );
    if (actionOrError.isLeft()) {
      this.logger.error(
        `Failed to create FundingAction from event: ${actionOrError.value.message}`,
      );
      return;
    }
    await this.fundingActionRepository.save(actionOrError.value);
  }
}
