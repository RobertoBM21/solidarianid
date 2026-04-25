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
