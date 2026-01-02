import { AggregateRoot } from '@app/shared/domain';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventBus, IEvent } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { from, lastValueFrom, map, Subscription } from 'rxjs';
import { DomainEvent } from '../../domain/event';
import { DomainEventsPort } from '../../domain/ports/domain-events.port';
import { RABBITMQ_CLIENT } from '../config/rabbitmq.config';

@Injectable()
export class RabbitmqClientAdapter implements DomainEventsPort {
  private readonly logger = new Logger(RabbitmqClientAdapter.name);

  constructor(
    private readonly eventBus: EventBus,
    @Inject(RABBITMQ_CLIENT)
    private readonly client: ClientProxy,
  ) {}

  async dispatch(aggregate: AggregateRoot<unknown>): Promise<void> {
    const events = aggregate.pullDomainEvents();
    await this.eventBus.publishAll(events);
  }

  setupIntegrationEvents(): Subscription {
    return this.eventBus
      .pipe(map((event) => from(this.publish(event))))
      .subscribe();
  }

  private async publish(event: IEvent): Promise<void> {
    this.logger.debug(`Publishing event ${event.constructor.name} to RabbitMQ`);
    const patternName = event.constructor.name;
    try {
      await lastValueFrom(this.client.emit<DomainEvent>(patternName, event));
    } catch (error) {
      this.logger.error(
        `Failed to publish event ${patternName} to RabbitMQ`,
        (error as Error).message,
      );
      throw error;
    }
  }
}
