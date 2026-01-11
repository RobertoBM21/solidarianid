import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventBus, IEvent } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { from, lastValueFrom, map, Subscription, timeout } from 'rxjs';
import { AggregateRoot, Either, left, right } from '../../domain';
import { DomainEvent } from '../../domain/event';
import {
  DomainEventError,
  DomainEventsPort,
} from '../../domain/ports/domain-events.port';
import { NATS_CLIENT } from '../config/nats.config';

@Injectable()
export class NatsClientAdapter implements DomainEventsPort {
  private readonly logger = new Logger(NatsClientAdapter.name);

  constructor(
    private readonly eventBus: EventBus,
    @Inject(NATS_CLIENT)
    private readonly client: ClientProxy,
  ) {}

  async dispatch(aggregate: AggregateRoot<unknown>): Promise<void> {
    const events = aggregate.pullDomainEvents();
    await this.eventBus.publishAll(events);
  }

  async query<T>(event: DomainEvent): Promise<Either<DomainEventError, T>> {
    this.logger.debug(`Querying event ${event.constructor.name} via NATS`);
    const patternName = event.constructor.name;
    try {
      const result = await lastValueFrom(
        this.client.send<T>(patternName, event).pipe(timeout(4000)),
      );
      return right(result);
    } catch (error) {
      const errMsg = `Failed to query event ${patternName} via NATS: ${String(error)}`;
      this.logger.error(errMsg);
      return left(new DomainEventError(errMsg));
    }
  }

  setupIntegrationEvents(): Subscription {
    return this.eventBus
      .pipe(map((event) => from(this.publish(event))))
      .subscribe();
  }

  private async publish(event: IEvent): Promise<void> {
    this.logger.debug(`Publishing event ${event.constructor.name} to NATS`);
    const patternName = event.constructor.name;
    try {
      await lastValueFrom(this.client.emit<DomainEvent>(patternName, event));
    } catch (error) {
      this.logger.error(
        `Failed to publish event ${patternName} to NATS`,
        (error as Error).message,
      );
      throw error;
    }
  }
}
