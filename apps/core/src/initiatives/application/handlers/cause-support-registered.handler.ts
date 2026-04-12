import { UniqueEntityID } from '@app/shared/domain';
import { Logger } from '@nestjs/common';
import { EventsHandler } from '@nestjs/cqrs';
import { CauseSupport } from '../../domain/aggregates/cause-support.aggregate';
import { CauseSupportRegisteredEvent } from '../../domain/events/cause-support-registered.event';
import { CauseSupportRepository } from '../../domain/repositories/cause-support.repository';
import {
  AnonymousSupporter,
  UserSupporter,
} from '../../domain/value-objects/supporter.vo';

@EventsHandler(CauseSupportRegisteredEvent)
export class CauseSupportRegisteredHandler {
  private readonly logger = new Logger(CauseSupportRegisteredHandler.name);

  constructor(
    private readonly causeSupportRepository: CauseSupportRepository,
  ) {}

  async handle(event: CauseSupportRegisteredEvent): Promise<void> {
    const supporterId = UniqueEntityID.create(event.supporterId);
    const supporter =
      event.supporterType === 'user'
        ? UserSupporter.create(supporterId)
        : AnonymousSupporter.create(supporterId);

    const supportOrError = CauseSupport.create({
      causeId: event.causeId,
      supporter,
    });
    if (supportOrError.isLeft()) {
      this.logger.error(supportOrError.value);
      return;
    }
    await this.causeSupportRepository.save(supportOrError.value);
  }
}
