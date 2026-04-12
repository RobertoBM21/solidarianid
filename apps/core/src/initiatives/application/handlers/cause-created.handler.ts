import { Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';
import { CauseCreatedEvent } from '../../../communities/domain/events/cause-created.event';
import { CauseAggr } from '../../domain/aggregates/cause.aggregate';
import { CauseAggrRepository } from '../../domain/repositories/cause-aggr.repository';

@EventsHandler(CauseCreatedEvent)
export class CauseCreatedHandler {
  private readonly logger = new Logger(CauseCreatedHandler.name);

  constructor(private readonly causeAggrRepository: CauseAggrRepository) {}

  async handle(event: CauseCreatedEvent): Promise<void> {
    const causeAggrOrError = CauseAggr.create({
      id: event.causeId,
      title: event.causeTitle,
      communityId: event.communityId,
    });
    if (causeAggrOrError.isLeft()) {
      this.logger.error(causeAggrOrError.value);
      return;
    }
    const causeAggr = causeAggrOrError.value;
    await this.causeAggrRepository.save(causeAggr);
  }
}
