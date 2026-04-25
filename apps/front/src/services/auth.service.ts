import type { ApiClient } from '../lib/http/api-client';

interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  country: string;
}

interface AuthResponse {
  access_token: string;
}

export async function registerUser(
  data: RegisterPayload,
  client: ApiClient,
): Promise<AuthResponse> {
  const res = await client.post('/auth/register', data);

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    throw new Error(
      client.parseErrorMessage(
        body,
        'Error al registrar la cuenta. Inténtalo de nuevo.',
      ),
    );
  }

  return (await res.json()) as AuthResponse;
}
