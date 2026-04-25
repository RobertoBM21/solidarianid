'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useFetchClient } from '../../lib/http/use-fetch-client';
import { syncPendingActions } from '../../lib/pwa/sync-engine';

export default function SyncPendingActions() {
  const fetchClient = useFetchClient();
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken ?? '';

  useEffect(() => {
    if (status !== 'authenticated' || !accessToken) {
      return;
    }

    const runSync = () => {
      if (!navigator.onLine) {
        return;
      }

      void syncPendingActions(fetchClient).catch((error: unknown) => {
        console.error('Error sincronizando acciones pendientes:', error);
      });
    };

    runSync();

    window.addEventListener('online', runSync);

    return () => {
      window.removeEventListener('online', runSync);
    };
  }, [accessToken, fetchClient, status]);

  return null;
}
