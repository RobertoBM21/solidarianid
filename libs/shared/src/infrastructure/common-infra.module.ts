import { Global, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'reflect-metadata';
import { Subscription } from 'rxjs';
import { DomainEventsPort } from '../domain/ports/domain-events.port';
import { PasswordHasherPort } from '../domain/ports/password-hasher.port';
import { NatsClientAdapter } from './adapters/nats-client.adapter';
import { PasswordHasherAdapter } from './adapters/password-hasher.adapter';
import databaseConfig from './config/database.config';
import { NATS_CLIENT, natsConfig } from './config/nats.config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`, '.env'],
    }),
    CqrsModule.forRoot(),

    ClientsModule.registerAsync([
      {
        name: NATS_CLIENT,
        ...natsConfig.asProvider(),
      },
    ]),

    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
  ],
  providers: [
    NatsClientAdapter,

    {
      provide: DomainEventsPort,
      useClass: NatsClientAdapter,
    },
    PasswordHasherAdapter,
    {
      provide: PasswordHasherPort,
      useExisting: PasswordHasherAdapter,
    },
  ],
  exports: [ConfigModule, TypeOrmModule, DomainEventsPort, PasswordHasherPort],
})
export class CommonInfrastructureModule
  implements OnModuleInit, OnModuleDestroy
{
  private sub?: Subscription;

  constructor(private readonly natsClientAdapter: NatsClientAdapter) {}

  onModuleInit() {
    this.sub = this.natsClientAdapter.setupIntegrationEvents();
  }

  onModuleDestroy() {
    this.sub?.unsubscribe();
  }
}
