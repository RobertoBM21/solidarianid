import type { PushSubscriptionInputDto } from '../dtos/push-subscription-input.dto';

export abstract class PushSubscriptionsPort {
  abstract registerSubscription(
    userId: string,
    subscription: PushSubscriptionInputDto,
  ): Promise<void>;

  abstract removeSubscription(userId: string, endpoint: string): Promise<void>;
}
