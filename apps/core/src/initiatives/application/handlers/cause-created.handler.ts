import { EventsHandler } from '@nestjs/cqrs';
import { CauseCreatedEvent } from '../../../communities/domain/events/cause-created.event';
import { CauseAggr } from '../../domain/aggregates/cause.aggregate';
import { CauseAggrRepository } from '../../domain/repositories/cause-aggr.repository';

@EventsHandler(CauseCreatedEvent)
export class CauseCreatedHandler {
  constructor(private readonly causeAggrRepository: CauseAggrRepository) {}

  async handle(event: CauseCreatedEvent): Promise<void> {
    const causeAggr = CauseAggr.create({
      id: event.causeId,
      communityId: event.communityId,
    });
    await this.causeAggrRepository.save(causeAggr);
  }
}
