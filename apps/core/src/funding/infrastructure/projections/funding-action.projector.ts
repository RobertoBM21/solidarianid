import {
  AllStreamSubscription,
  KurrentDBClient,
  START,
  streamNameFilter,
} from '@kurrent/kurrentdb-client';
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CauseClosedEvent } from '../../../communities/domain/events/cause-closed.event';
import { FundingActionCreatedEvent } from '../../../initiatives/domain/events/funding-action-created.event';
import { FundingActionDbEntity } from '../../../initiatives/infrastructure/persistence/entities/funding-action.db-entity';
import { DONATION_PROCESSED } from '../../domain/events/donation-processed.event';
import { KURRENTDB_CLIENT } from '../config/kurrentdb.config';
import { FundingActionAggrDbEntity } from '../persistence/entities/funding-action-aggr.db-entity';
import { ProjectionCheckpointEntity } from './projection-checkpoint.entity';

@Injectable()
export class FundingActionProjector implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FundingActionProjector.name);
  private static readonly CHECKPOINT_KEY = 'funding-action-projector';
  private subscription: AllStreamSubscription | null = null;

  constructor(
    @Inject(KURRENTDB_CLIENT) private readonly client: KurrentDBClient,
    private readonly em: EntityManager,
  ) {}

  onModuleInit(): void {
    this.startSubscription().catch((err: unknown) => {
      this.logger.error(
        'FundingActionProjector subscription failed to start',
        err,
      );
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.subscription) {
      await this.subscription.unsubscribe();
      this.subscription = null;
    }
    await this.client.dispose();
  }

  private async loadCheckpoint(): Promise<bigint | null> {
    const row = await this.em.findOne(ProjectionCheckpointEntity, {
      where: { name: FundingActionProjector.CHECKPOINT_KEY },
    });
    return row ? BigInt(row.position) : null;
  }

  private async saveCheckpoint(position: bigint): Promise<void> {
    await this.em.upsert(
      ProjectionCheckpointEntity,
      {
        name: FundingActionProjector.CHECKPOINT_KEY,
        position: position.toString(),
      },
      ['name'],
    );
  }

  private async startSubscription(): Promise<void> {
    this.logger.log('Subscribing to funding-action-* streams via $all');

    const checkpoint = await this.loadCheckpoint();
    const fromPosition =
      checkpoint !== null ? { commit: checkpoint, prepare: checkpoint } : START;

    this.subscription = this.client.subscribeToAll({
      fromPosition,
      filter: streamNameFilter({ prefixes: ['funding-action-'] }),
    });

    for await (const resolvedEvent of this.subscription) {
      const { event } = resolvedEvent;
      if (!event) continue;
      try {
        await this.handleEvent(
          event.type,
          event.data as Record<string, unknown>,
        );
        await this.saveCheckpoint(resolvedEvent.commitPosition ?? 0n);
      } catch (handlerErr: unknown) {
        this.logger.error(
          `Error processing event ${event.type} (id: ${event.id})`,
          handlerErr,
        );
      }
    }
  }

  private async handleEvent(
    type: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    switch (type) {
      case FundingActionCreatedEvent.name:
        await this.onFundingActionCreated(data);
        break;
      case DONATION_PROCESSED:
        await this.onDonationProcessed(data);
        break;
      case CauseClosedEvent.name:
        await this.onFundingActionClosed(data);
        break;
      default:
        break;
    }
  }

  private async onFundingActionCreated(
    data: Record<string, unknown>,
  ): Promise<void> {
    const entity = new FundingActionAggrDbEntity();
    entity.id = data.actionId as string;
    entity.title = data.title as string;
    entity.causeId = data.causeId as string;
    entity.closed = false;
    entity.currentAmount = 0;

    await this.em.upsert(FundingActionAggrDbEntity, entity, ['id']);
    this.logger.debug(`Projected FundingActionCreated for action ${entity.id}`);
  }

  private async onDonationProcessed(
    data: Record<string, unknown>,
  ): Promise<void> {
    const actionId = (data.actionId as string | undefined) ?? '';
    const amount = data.amount as number;

    if (!actionId) {
      this.logger.warn('DonationProcessed event missing actionId in data');
      return;
    }

    await this.em.increment(
      FundingActionAggrDbEntity,
      { id: actionId },
      'currentAmount',
      amount,
    );

    await this.em.increment(
      FundingActionDbEntity,
      { id: actionId },
      'currentAmount',
      amount,
    );

    this.logger.debug(
      `Projected DonationProcessed: +${String(amount)} to action ${actionId}`,
    );
  }

  private async onFundingActionClosed(
    data: Record<string, unknown>,
  ): Promise<void> {
    const actionId = data.actionId as string | undefined;
    if (!actionId) {
      this.logger.warn('CauseClosedEvent missing actionId in data');
      return;
    }

    await this.em.update(
      FundingActionAggrDbEntity,
      { id: actionId },
      { closed: true },
    );

    await this.em.update(
      FundingActionDbEntity,
      { id: actionId },
      { closed: true },
    );

    this.logger.debug(`Projected FundingActionClosed for action ${actionId}`);
  }
}
