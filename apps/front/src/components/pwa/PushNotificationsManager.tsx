'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import { useFetchClient } from '../../lib/http/use-fetch-client';
import {
  registerPushSubscription,
  removePushSubscription,
} from '../../services/push-notifications.service';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';
const VAPID_CONFIG_ERROR = VAPID_PUBLIC_KEY
  ? ''
  : 'Falta la clave pública VAPID en la configuración del frontend.';

function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const normalized = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(normalized);
  const bytes = Uint8Array.from(rawData, (character) =>
    character.charCodeAt(0),
  );

  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  );
}

async function ensureServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  const existingRegistration =
    await navigator.serviceWorker.getRegistration('/');

  if (existingRegistration) {
    return existingRegistration;
  }

  return navigator.serviceWorker.register('/sw.js', {
    scope: '/',
    updateViaCache: 'none',
  });
}

export default function PushNotificationsManager() {
  const apiClient = useFetchClient();
  const { status } = useSession();
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(VAPID_CONFIG_ERROR);

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    let active = true;

    async function syncSubscriptionState() {
      if (!isPushSupported()) {
        if (active) {
          setSupported(false);
        }
        return;
      }

      if (VAPID_CONFIG_ERROR) {
        if (active) {
          setSupported(true);
          setPermission(Notification.permission);
          setError(VAPID_CONFIG_ERROR);
        }
        return;
      }

      if (active) {
        setSupported(true);
        setPermission(Notification.permission);
      }

      try {
        const registration = await ensureServiceWorkerRegistration();
        const subscription = await registration.pushManager.getSubscription();

        if (!active) {
          return;
        }

        setSubscribed(Boolean(subscription));

        if (subscription) {
          await registerPushSubscription(subscription, apiClient);
        }
      } catch (syncError) {
        if (!active) {
          return;
        }

        setError(
          syncError instanceof Error
            ? syncError.message
            : 'No se pudo comprobar el estado de las notificaciones push.',
        );
      }
    }

    void syncSubscriptionState();

    return () => {
      active = false;
    };
  }, [apiClient, status]);

  async function handleEnableNotifications() {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (!isPushSupported()) {
        throw new Error(
          'Este navegador no soporta notificaciones push en esta aplicación.',
        );
      }

      if (VAPID_CONFIG_ERROR) {
        throw new Error(VAPID_CONFIG_ERROR);
      }

      const nextPermission =
        Notification.permission === 'granted'
          ? 'granted'
          : await Notification.requestPermission();

      setPermission(nextPermission);

      if (nextPermission !== 'granted') {
        throw new Error(
          'Debes conceder permiso a las notificaciones para activarlas.',
        );
      }

      const registration = await ensureServiceWorkerRegistration();
      const existingSubscription =
        await registration.pushManager.getSubscription();

      const subscription =
        existingSubscription ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToArrayBuffer(VAPID_PUBLIC_KEY),
        }));

      await registerPushSubscription(subscription, apiClient);

      setSubscribed(true);
      setMessage('Notificaciones push activadas correctamente.');
    } catch (subscriptionError) {
      setError(
        subscriptionError instanceof Error
          ? subscriptionError.message
          : 'No se pudieron activar las notificaciones push.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDisableNotifications() {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const registration = await ensureServiceWorkerRegistration();
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        setSubscribed(false);
        setMessage('No había una suscripción push activa en este navegador.');
        return;
      }

      await removePushSubscription(subscription.endpoint, apiClient);
      await subscription.unsubscribe();

      setSubscribed(false);
      setMessage('Notificaciones push desactivadas correctamente.');
    } catch (subscriptionError) {
      setError(
        subscriptionError instanceof Error
          ? subscriptionError.message
          : 'No se pudieron desactivar las notificaciones push.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (status !== 'authenticated') {
    return null;
  }

  return (
    <div className="mt-3">
      <p className="mb-2 text-muted">
        <strong>Notificaciones push:</strong>{' '}
        {!supported
          ? 'No disponibles en este navegador.'
          : subscribed
            ? 'Activadas en este navegador.'
            : permission === 'denied'
              ? 'Bloqueadas por el navegador.'
              : 'Desactivadas en este navegador.'}
      </p>

      <div className="d-flex gap-2 flex-wrap">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => {
            void handleEnableNotifications();
          }}
          disabled={
            loading || !supported || Boolean(VAPID_CONFIG_ERROR) || subscribed
          }
        >
          {loading && !subscribed ? 'Activando...' : 'Activar notificaciones'}
        </Button>

        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => {
            void handleDisableNotifications();
          }}
          disabled={loading || !supported || !subscribed}
        >
          {loading && subscribed
            ? 'Desactivando...'
            : 'Desactivar notificaciones'}
        </Button>
      </div>

      {message ? (
        <Alert variant="success" className="mt-2 mb-0">
          {message}
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="danger" className="mt-2 mb-0">
          {error}
        </Alert>
      ) : null}
    </div>
  );
}
