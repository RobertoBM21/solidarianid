'use client';

import { useEffect } from 'react';

export default function RegisterServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Service Worker registrado', reg);
        })
        .catch((error: unknown) => {
          console.error('Error registrando SW:', error);
        });
    }
  }, []);

  return null;
}
