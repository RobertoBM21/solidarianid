import { Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';
import { VolunteeringAction } from '../../domain/aggregates/action.aggregate';
import { VolunteeringActionCreatedEvent } from '../../domain/events/volunteering-action-created.event';
import { ActionRepository } from '../../domain/repositories/action.repository';

@EventsHandler(VolunteeringActionCreatedEvent)
export class VolunteeringActionCreatedHandler {
  private readonly logger = new Logger(VolunteeringActionCreatedHandler.name);

  constructor(private readonly actionRepository: ActionRepository) {}

  async handle(event: VolunteeringActionCreatedEvent): Promise<void> {
    const actionOrError = VolunteeringAction.create(
      {
        title: event.title,
        description: event.description,
        objectives: event.objectives,
        causeId: event.causeId,
        start: event.start,
        end: event.end,
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
