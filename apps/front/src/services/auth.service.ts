const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:3010';

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
): Promise<AuthResponse> {
  const res = await fetch(`${GATEWAY_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const detail =
      typeof body === 'object' && body !== null && 'message' in body
        ? (body as { message: unknown }).message
        : null;
    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail) && typeof detail[0] === 'string'
          ? detail[0]
          : 'Error al registrar la cuenta. Inténtalo de nuevo.';
    throw new Error(message);
  }

  return (await res.json()) as AuthResponse;
}
