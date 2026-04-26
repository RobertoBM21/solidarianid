import type { ApiClient } from '../lib/http/api-client';

export async function registerPushSubscription(
  subscription: PushSubscription,
  client: ApiClient,
): Promise<void> {
  const payload = subscription.toJSON();
  const p256dh = payload.keys?.p256dh;
  const auth = payload.keys?.auth;

  if (!payload.endpoint || !p256dh || !auth) {
    throw new Error('La suscripción push del navegador no es válida.');
  }

  const response = await client.post('/push-subscriptions', {
    endpoint: payload.endpoint,
    expirationTime: payload.expirationTime ?? null,
    keys: {
      p256dh,
      auth,
    },
  });

  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    throw new Error(
      client.parseErrorMessage(data, 'Error al registrar la suscripción push.'),
    );
  }
}

export async function removePushSubscription(
  endpoint: string,
  client: ApiClient,
): Promise<void> {
  const response = await client.delete(
    `/push-subscriptions/${encodeURIComponent(endpoint)}`,
  );

  if (response.status === 404) {
    return;
  }

  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    throw new Error(
      client.parseErrorMessage(data, 'Error al eliminar la suscripción push.'),
    );
  }
}
