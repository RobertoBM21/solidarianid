export interface PushSubscriptionInputDto {
  endpoint: string;
  expirationTime?: number | null;
  p256dh: string;
  auth: string;
}
