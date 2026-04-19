import { Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';
import { CauseClosedEvent } from '../../../communities/domain/events/cause-closed.event';
import { VolunteeringActionRepository } from '../../domain/repositories/volunteering-action.repository';

@EventsHandler(CauseClosedEvent)
export class VolunteeringCauseClosedHandler {
  private readonly logger = new Logger(VolunteeringCauseClosedHandler.name);

  constructor(
    private readonly volunteeringActionRepository: VolunteeringActionRepository,
  ) {}

  async handle(event: CauseClosedEvent): Promise<void> {
    const actions = await this.volunteeringActionRepository.findAllByCauseId(
      event.causeId,
    );
    for (const action of actions) {
      action.close();
      await this.volunteeringActionRepository.save(action);
    }
  }
}
