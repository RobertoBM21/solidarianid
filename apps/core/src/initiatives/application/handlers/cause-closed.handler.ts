import { UniqueEntityID } from '@app/shared/domain/entity';
import { Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';
import { CauseClosedEvent } from '../../../communities/domain/events/cause-closed.event';
import { CauseAggrRepository } from '../../domain/repositories/cause-aggr.repository';

@EventsHandler(CauseClosedEvent)
export class CauseClosedHandler {
  private readonly logger = new Logger(CauseClosedHandler.name);

  constructor(private readonly causeAggrRepository: CauseAggrRepository) {}

  async handle(event: CauseClosedEvent): Promise<void> {
    const causeId = UniqueEntityID.create(event.causeId);
    const causeAggrOrError = await this.causeAggrRepository.findById(causeId);
    if (causeAggrOrError.isLeft()) {
      this.logger.error(
        `Error occurred while fetching cause aggregate: ${causeAggrOrError.value.message}`,
      );
      return;
    }
    const causeAggr = causeAggrOrError.value;
    const closedOrError = causeAggr.close();
    if (closedOrError.isLeft()) {
      this.logger.error(
        `Error occurred while closing cause aggregate: ${closedOrError.value.message}`,
      );
      return;
    }
    await this.causeAggrRepository.save(causeAggr);
  }
}
