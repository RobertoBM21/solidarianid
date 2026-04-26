import { Injectable } from '@nestjs/common';
import type { PushSubscriptionInputDto } from '../dtos/push-subscription-input.dto';
import { PushSubscriptionRepository } from '../ports/push-subscription-repository.port';
import { PushSubscriptionsPort } from '../ports/push-subscriptions.port';

@Injectable()
export class PushSubscriptionsService implements PushSubscriptionsPort {
  constructor(
    private readonly pushSubscriptionRepository: PushSubscriptionRepository,
  ) {}

  async registerSubscription(
    userId: string,
    subscription: PushSubscriptionInputDto,
  ): Promise<void> {
    await this.pushSubscriptionRepository.save(userId, {
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime ?? null,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    });
  }

  async removeSubscription(userId: string, endpoint: string): Promise<void> {
    await this.pushSubscriptionRepository.deleteByUserIdAndEndpoint(
      userId,
      endpoint,
    );
  }
}
