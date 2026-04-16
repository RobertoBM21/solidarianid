'use client';

import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:3010';

export function useFetchClient() {
  const { data: session } = useSession();

  const fetchClient = useCallback(
    async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
      const headers = new Headers(options.headers);

      if (session?.accessToken) {
        headers.set('Authorization', `Bearer ${session.accessToken}`);
      }

      if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }

      return fetch(`${GATEWAY_URL}${endpoint}`, {
        ...options,
        headers,
      });
    },
    [session?.accessToken],
  );

  return fetchClient;
}
