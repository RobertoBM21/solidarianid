import { Injectable, Logger } from '@nestjs/common';
import { PushNotificationPort } from '../application/ports/push-notification.port';
import {
  PushSubscriptionRepository,
  type UserPushSubscriptionRecord,
} from '../application/ports/push-subscription-repository.port';

@Injectable()
export class NotificationsIntegrationService {
  private readonly logger = new Logger(NotificationsIntegrationService.name);

  constructor(
    private readonly pushSubscriptionRepository: PushSubscriptionRepository,
    private readonly pushNotificationPort: PushNotificationPort,
  ) {}

  async send(userId: string, payload: Record<string, unknown>): Promise<void> {
    const subscriptions =
      await this.pushSubscriptionRepository.findByUserId(userId);

    if (subscriptions.length === 0) {
      return;
    }

    await Promise.all(
      subscriptions.map(async (record) => {
        try {
          await this.pushNotificationPort.send(record.subscription, payload);
        } catch (error) {
          this.logSendError(userId, record, error);
        }
      }),
    );
  }

  private logSendError(
    userId: string,
    record: UserPushSubscriptionRecord,
    error: unknown,
  ): void {
    this.logger.error(
      `Failed to send push notification to userId: ${userId} and endpoint: ${record.subscription.endpoint}`,
      error instanceof Error ? error.stack : undefined,
    );
  }
}
