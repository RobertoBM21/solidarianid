import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/auth-options';
import { ApiClient } from './api-client';

const GATEWAY_URL =
  process.env.INTERNAL_GATEWAY_URL ??
  process.env.NEXT_PUBLIC_GATEWAY_URL ??
  'http://localhost:3010';

export function fetchServer(): ApiClient {
  return new ApiClient(async (endpoint, options = {}) => {
    const session = await getServerSession(authOptions);

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
  });
}
