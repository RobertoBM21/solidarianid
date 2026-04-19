import { Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';
import { VolunteeringActionCreatedEvent } from '../../../initiatives/domain/events/volunteering-action-created.event';
import { VolunteeringAction } from '../../domain/aggregates/volunteering-action.aggregate';
import { VolunteeringActionRepository } from '../../domain/repositories/volunteering-action.repository';

@EventsHandler(VolunteeringActionCreatedEvent)
export class VolunteeringActionCreatedHandler {
  private readonly logger = new Logger(VolunteeringActionCreatedHandler.name);

  constructor(
    private readonly volunteeringActionRepository: VolunteeringActionRepository,
  ) {}

  async handle(event: VolunteeringActionCreatedEvent): Promise<void> {
    const actionOrError = VolunteeringAction.create(
      {
        title: event.title,
        causeId: event.causeId,
      },
      event.actionId,
    );
    if (actionOrError.isLeft()) {
      this.logger.error(
        `Failed to create VolunteeringAction from event: ${actionOrError.value.message}`,
      );
      return;
    }
    await this.volunteeringActionRepository.save(actionOrError.value);
  }
}
