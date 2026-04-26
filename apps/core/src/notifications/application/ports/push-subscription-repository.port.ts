import type { WebPushSubscription } from './push-notification.port';

export interface UserPushSubscriptionRecord {
  userId: string;
  subscription: WebPushSubscription;
}

export abstract class PushSubscriptionRepository {
  abstract save(
    userId: string,
    subscription: WebPushSubscription,
  ): Promise<void>;

  abstract findByUserId(userId: string): Promise<UserPushSubscriptionRecord[]>;

  abstract deleteByUserIdAndEndpoint(
    userId: string,
    endpoint: string,
  ): Promise<void>;
}
