import { getEnvVar } from '@app/shared/utils';
import { registerAs } from '@nestjs/config';
import { NatsOptions, Transport } from '@nestjs/microservices';

export const NATS_CLIENT = 'NATS_CLIENT';

export const natsConfig = registerAs<NatsOptions>('nats', () => ({
  transport: Transport.NATS,
  options: {
    servers: [getEnvVar('NATS_URL')],
  },
}));
