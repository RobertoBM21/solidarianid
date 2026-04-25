import { Either, left, right, UniqueEntityID } from '@app/shared/domain';
import {
  ANY,
  jsonEvent,
  KurrentDBClient,
  NO_STREAM,
  StreamNotFoundError,
  WrongExpectedVersionError,
} from '@kurrent/kurrentdb-client';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CauseClosedEvent } from '../../../../communities/domain/events/cause-closed.event';
import { FundingActionCreatedEvent } from '../../../../initiatives/domain/events/funding-action-created.event';
import {
  FundingAction,
  FundingActionData,
  FundingActionEvent,
} from '../../../domain/aggregates/funding-action.aggregate';
import {
  DONATION_PROCESSED,
  DonationProcessed,
} from '../../../domain/events/donation-processed.event';
import {
  FundingActionNotFoundError,
  FundingActionRepository,
} from '../../../domain/repositories/funding-action.repository';
import { KURRENTDB_CLIENT } from '../../config/kurrentdb.config';
import { FundingActionAggrDbEntity } from '../entities/funding-action-aggr.db-entity';

export class FundingActionConcurrencyError extends Error {
  constructor(public readonly actionId: string) {
    super(
      `Concurrency conflict saving FundingAction ${actionId}. Please retry.`,
    );
  }
}

@Injectable()
export class FundingActionEventStoreRepository
  implements FundingActionRepository
{
  private readonly logger = new Logger(FundingActionEventStoreRepository.name);

  constructor(
    @Inject(KURRENTDB_CLIENT) private readonly client: KurrentDBClient,
    private readonly em: EntityManager,
  ) {}

  private streamName(id: string): string {
    return `funding-action-${id}`;
  }

  async save(action: FundingAction): Promise<void> {
    const domainEvents = action.pullDomainEvents() as FundingActionEvent[];
    if (domainEvents.length === 0) return;

    const streamName = this.streamName(action.id.toString());
    const expectedRevision =
      action.version === -1n ? NO_STREAM : action.version;

    const events = domainEvents.map((e) =>
      jsonEvent({
        type: e.constructor.name,
        data: this.serializeEvent(e, action.id.toString()),
      }),
    );

    try {
      await this.client.appendToStream(streamName, events, {
        streamState: expectedRevision,
      });
    } catch (err) {
      if (err instanceof WrongExpectedVersionError) {
        this.logger.warn(
          `Optimistic concurrency conflict for stream ${streamName}`,
        );
        throw new FundingActionConcurrencyError(action.id.toString());
      }
      throw err;
    }
  }

  async findById(
    id: UniqueEntityID,
  ): Promise<Either<FundingActionNotFoundError, FundingAction>> {
    const streamName = this.streamName(id.toString());

    try {
      const events: { event: FundingActionEvent; revision: bigint }[] = [];

      const result = this.client.readStream(streamName, {
        fromRevision: 'start',
        direction: 'forwards',
      });

      for await (const resolvedEvent of result) {
        const { event } = resolvedEvent;
        if (!event) continue;
        const domainEvent = this.deserializeEvent(
          event.type,
          event.data as Record<string, unknown>,
        );
        if (domainEvent) {
          events.push({ event: domainEvent, revision: event.revision });
        }
      }

      if (events.length === 0) {
        return left(new FundingActionNotFoundError(id.toString()));
      }

      return right(this.reconstitute(id.toString(), events));
    } catch (err) {
      if (err instanceof StreamNotFoundError) {
        return left(new FundingActionNotFoundError(id.toString()));
      }
      throw err;
    }
  }

  async findAllByCauseId(causeId: string): Promise<FundingAction[]> {
    const entities = await this.em.find(FundingActionAggrDbEntity, {
      where: { causeId },
    });
    const actions: FundingAction[] = [];
    for (const entity of entities) {
      const result = await this.findById(UniqueEntityID.create(entity.id));
      if (result.isRight()) {
        actions.push(result.value);
      } else {
        this.logger.warn(
          `Read model has action ${entity.id} but no KurrentDB stream found`,
        );
      }
    }
    return actions;
  }

  async remove(
    id: UniqueEntityID,
  ): Promise<Either<FundingActionNotFoundError, void>> {
    const streamName = this.streamName(id.toString());
    try {
      await this.client.deleteStream(streamName, { expectedRevision: ANY });
      return right(undefined);
    } catch (err) {
      if (err instanceof StreamNotFoundError) {
        return left(new FundingActionNotFoundError(id.toString()));
      }
      throw err;
    }
  }

  private reconstitute(
    id: string,
    events: { event: FundingActionEvent; revision: bigint }[],
  ): FundingAction {
    const data: FundingActionData = {
      title: '',
      causeId: '',
      currentAmount: 0,
    };
    let version = -1n;

    for (const { event, revision } of events) {
      if (event instanceof FundingActionCreatedEvent) {
        data.title = event.title;
        data.causeId = event.causeId;
      } else if (event instanceof DonationProcessed) {
        data.currentAmount = (data.currentAmount ?? 0) + event.amount;
      } else if (event instanceof CauseClosedEvent) {
        data.closed = true;
      }
      version = revision;
    }

    data.version = version;
    return FundingAction.create(data, id).value as FundingAction;
  }

  private serializeEvent(
    event: FundingActionEvent,
    actionId: string,
  ): Record<string, unknown> {
    if (event instanceof FundingActionCreatedEvent) {
      return {
        actionId: event.actionId,
        title: event.title,
        causeId: event.causeId,
        occurredOn: event.occurredOn.toISOString(),
      };
    }
    if (event instanceof DonationProcessed) {
      return {
        actionId,
        donationId: event.donationId,
        donorId: event.donorId,
        amount: event.amount,
        externalPaymentId: event.externalPaymentId,
        processedAt: event.processedAt.toISOString(),
        occurredOn: event.occurredOn.toISOString(),
      };
    }
    if (event instanceof CauseClosedEvent) {
      return {
        actionId,
        causeId: event.causeId,
        occurredOn: event.occurredOn.toISOString(),
      };
    }
    return {};
  }

  private deserializeEvent(
    type: string,
    data: Record<string, unknown>,
  ): FundingActionEvent | null {
    switch (type) {
      case FundingActionCreatedEvent.name:
        return new FundingActionCreatedEvent(
          data.actionId as string,
          data.title as string,
          '',
          [],
          data.causeId as string,
          0,
        );
      case DONATION_PROCESSED:
        return new DonationProcessed(
          data.donationId as string,
          data.donorId as string,
          data.amount as number,
          data.externalPaymentId as string,
          new Date(data.processedAt as string),
        );
      case CauseClosedEvent.name:
        return new CauseClosedEvent(data.causeId as string);
      default:
        this.logger.warn(`Unknown event type in stream: ${type}`);
        return null;
    }
  }
}
