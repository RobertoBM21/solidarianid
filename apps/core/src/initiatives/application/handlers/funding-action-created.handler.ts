import { Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';
import { FundingAction } from '../../domain/aggregates/action.aggregate';
import { FundingActionCreatedEvent } from '../../domain/events/funding-action-created.event';
import { ActionRepository } from '../../domain/repositories/action.repository';

@EventsHandler(FundingActionCreatedEvent)
export class FundingActionCreatedHandler {
  private readonly logger = new Logger(FundingActionCreatedHandler.name);

  constructor(private readonly actionRepository: ActionRepository) {}

  async handle(event: FundingActionCreatedEvent): Promise<void> {
    const actionOrError = FundingAction.create(
      {
        title: event.title,
        description: event.description,
        objectives: event.objectives,
        causeId: event.causeId,
        targetAmount: event.targetAmount,
      },
      event.actionId,
    );
    if (actionOrError.isLeft()) {
      this.logger.error(actionOrError.value);
      return;
    }
    await this.actionRepository.save(actionOrError.value);
  }
}
