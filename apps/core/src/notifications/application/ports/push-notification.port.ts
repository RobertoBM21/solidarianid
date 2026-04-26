export interface WebPushKeys {
  p256dh: string;
  auth: string;
}

export interface WebPushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: WebPushKeys;
}

export abstract class PushNotificationPort {
  abstract send(
    subscription: WebPushSubscription,
    payload: Record<string, unknown>,
  ): Promise<void>;
}
