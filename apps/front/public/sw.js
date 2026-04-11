/* eslint-disable */
/* eslint-env serviceworker */
/* global self, caches */

const currentCache = 'cache-v1.0';
const files_SHELL = [
  '/',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-128x128.png',
  '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(currentCache).then((cache) => {
      return cache.addAll(files_SHELL);
    }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== currentCache)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      ),
  );
});
