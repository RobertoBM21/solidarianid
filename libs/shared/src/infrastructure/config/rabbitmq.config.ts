import { registerAs } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { getEnvVar, getEnvVarAsInt, getFileFromEnvVar } from '../../utils';

export const RABBITMQ_CLIENT = 'RABBITMQ_CLIENT';

export const rabbitmqConfig = registerAs<RmqOptions>('rabbitmq', () => ({
  transport: Transport.RMQ,
  options: {
    urls: [buildRabbitmqUrl()],
    queue: getEnvVar('RABBITMQ_QUEUE'),
    noAck: true,
    queueOptions: {
      durable: true,
    },
  },
}));

function buildRabbitmqUrl(): string {
  const user = getEnvVar('RABBITMQ_USER');
  const pass = getFileFromEnvVar('RABBITMQ_PASSWORD_FILE');
  const host = getEnvVar('RABBITMQ_HOST');
  const port = getEnvVarAsInt('RABBITMQ_PORT', 5672).toFixed(0);

  return `amqp://${user}:${pass}@${host}:${port}/`;
}
