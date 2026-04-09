import { Provider } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

export const CAUSE_SUPPORT_PUBSUB = 'CAUSE_SUPPORT_PUBSUB';

export const causeSupportPubSubProvider: Provider = {
  provide: CAUSE_SUPPORT_PUBSUB,
  useValue: new PubSub(),
};
