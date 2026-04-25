'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useMemo } from 'react';
import { ApiClient, type FetchFn } from './api-client';

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:3010';

export function useFetchClient(): ApiClient {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const fetchFn: FetchFn = useCallback(
    async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
      const headers = new Headers(options.headers);

      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }

      if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }

      return fetch(`${GATEWAY_URL}${endpoint}`, {
        ...options,
        headers,
      });
    },
    [accessToken],
  );

  return useMemo(() => new ApiClient(fetchFn), [fetchFn]);
}
