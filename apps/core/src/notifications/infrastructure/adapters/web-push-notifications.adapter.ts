import { Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import * as webpush from 'web-push';
import {
  PushNotificationPort,
  type WebPushSubscription,
} from '../../application/ports/push-notification.port';
import vapidConfig from '../config/vapid.config';

@Injectable()
export class WebPushNotificationsAdapter extends PushNotificationPort {
  constructor(
    @Inject(vapidConfig.KEY)
    private readonly config: ConfigType<typeof vapidConfig>,
  ) {
    super();

    if (
      !this.config.publicKey ||
      !this.config.privateKey ||
      !this.config.subject
    ) {
      throw new Error(
        'VAPID configuration is incomplete. Please provide publicKey, privateKey, and subject.',
      );
    }

    webpush.setVapidDetails(
      this.config.subject,
      this.config.publicKey,
      this.config.privateKey,
    );
  }

  async send(
    subscription: WebPushSubscription,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  }
}
