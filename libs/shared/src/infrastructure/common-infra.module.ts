import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'reflect-metadata';
import { DomainEventsPort } from '../domain/ports/domain-events.port';
import { RabbitmqClientAdapter } from './adapters/rabbitmq-client.adapter';
import databaseConfig from './config/database.config';
import { RABBITMQ_CLIENT, rabbitmqConfig } from './config/rabbitmq.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`, '.env'],
    }),
    CqrsModule.forRoot(),

    ClientsModule.registerAsync([
      {
        name: RABBITMQ_CLIENT,
        ...rabbitmqConfig.asProvider(),
      },
    ]),

    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
  ],
  providers: [
    RabbitmqClientAdapter,

    {
      provide: DomainEventsPort,
      useClass: RabbitmqClientAdapter,
    },
  ],
  exports: [ConfigModule, TypeOrmModule, DomainEventsPort],
})
export class CommonInfrastructureModule implements OnModuleInit {
  constructor(private readonly rabbitmqClientAdapter: RabbitmqClientAdapter) {}

  onModuleInit() {
    this.rabbitmqClientAdapter.setupIntegrationEvents();
  }
}
