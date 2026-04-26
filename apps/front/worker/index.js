/* global self */

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import {
  cleanupOutdatedCaches,
  matchPrecache,
  precacheAndRoute,
} from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import {
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
  StaleWhileRevalidate,
} from 'workbox-strategies';

/**
 * @typedef {{ title: string; body: string; url: string }} PushNotificationData
 */

/**
 * @param {unknown} value
 * @returns {value is Partial<PushNotificationData>}
 */
function isPushNotificationPayload(value) {
  return typeof value === 'object' && value !== null;
}

/**
 * @param {unknown} data
 * @returns {string}
 */
function getNotificationUrl(data) {
  if (
    typeof data === 'object' &&
    data !== null &&
    'url' in data &&
    typeof data.url === 'string'
  ) {
    return data.url;
  }

  return '/profile';
}

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

registerRoute(
  ({ url }) => url.pathname.startsWith('/_next/static/'),
  new StaleWhileRevalidate({
    cacheName: 'front-static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  }),
);

registerRoute(
  ({ url }) => /\/_next\/image\?url=.+$/i.test(url.href),
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 64,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) =>
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/favicon.ico' ||
    ['image', 'font'].includes(request.destination),
  new CacheFirst({
    cacheName: 'front-media-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/auth/'),
  new NetworkOnly(),
);

registerRoute(
  ({ url }) => /\/_next\/data\/.+\/.+\.json$/i.test(url.pathname),
  new NetworkFirst({
    cacheName: 'next-data',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') return false;
    if (url.pathname.startsWith('/api/')) return false;

    return ![
      /^\/profile(?:\/|$)/,
      /^\/communities\/create(?:\/|$)/,
      /^\/communities\/[^/]+\/management(?:\/|$)/,
      /^\/donations\/(?:complete|completed)(?:\/|$)/,
      /^\/auth(?:\/|$)/,
    ].some((pattern) => pattern.test(url.pathname));
  },
  new NetworkFirst({
    cacheName: 'front-pages',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 40,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  }),
);

setCatchHandler(async ({ event }) => {
  if (event.request.mode === 'navigate') {
    return matchPrecache('/offline.html');
  }

  return Response.error();
});

self.addEventListener('push', (event) => {
  /** @type {PushNotificationData} */
  const defaultNotification = {
    title: 'SolidarianID',
    body: 'Tienes una nueva notificación.',
    url: '/profile',
  };

  const notification = { ...defaultNotification };

  if (event.data) {
    try {
      /** @type {unknown} */
      const data = event.data.json();

      if (isPushNotificationPayload(data) && typeof data.title === 'string') {
        notification.title = data.title;
      }

      if (isPushNotificationPayload(data) && typeof data.body === 'string') {
        notification.body = data.body;
      }

      if (isPushNotificationPayload(data) && typeof data.url === 'string') {
        notification.url = data.url;
      }
    } catch {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body = event.data.text();

      if (body) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        notification.body = body;
      }
    }
  }

  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-128x128.png',
      requireInteraction: true,
      data: {
        url: notification.url,
      },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  const targetUrl = getNotificationUrl(event.notification.data);

  event.notification.close();

  event.waitUntil(
    (async () => {
      const absoluteUrl = new URL(targetUrl, self.location.origin).href;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        if (client.url === absoluteUrl) {
          return client.focus();
        }
      }

      return self.clients.openWindow(absoluteUrl);
    })(),
  );
});
