import { Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';
import { CauseClosedEvent } from '../../../communities/domain/events/cause-closed.event';
import { FundingActionRepository } from '../../domain/repositories/funding-action.repository';

@EventsHandler(CauseClosedEvent)
export class FundingCauseClosedHandler {
  private readonly logger = new Logger(FundingCauseClosedHandler.name);

  constructor(
    private readonly fundingActionRepository: FundingActionRepository,
  ) {}

  async handle(event: CauseClosedEvent): Promise<void> {
    const actions = await this.fundingActionRepository.findAllByCauseId(
      event.causeId,
    );
    for (const action of actions) {
      action.close();
      await this.fundingActionRepository.save(action);
    }
  }
}
