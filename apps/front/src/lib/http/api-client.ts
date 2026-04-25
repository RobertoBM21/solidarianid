export type FetchFn = (
  endpoint: string,
  options?: RequestInit,
) => Promise<Response>;

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (
    typeof body === 'string' ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof URLSearchParams
  ) {
    return body as BodyInit;
  }
  return JSON.stringify(body);
}

export class ApiClient {
  constructor(private readonly fetchFn: FetchFn) {}

  get(
    endpoint: string,
    options?: Omit<RequestInit, 'method'>,
  ): Promise<Response> {
    return this.fetchFn(endpoint, { ...options, method: 'GET' });
  }

  post(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestInit, 'method' | 'body'>,
  ): Promise<Response> {
    const serialized = serializeBody(body);
    return this.fetchFn(endpoint, {
      ...options,
      method: 'POST',
      ...(serialized !== undefined ? { body: serialized } : {}),
    });
  }

  put(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestInit, 'method' | 'body'>,
  ): Promise<Response> {
    const serialized = serializeBody(body);
    return this.fetchFn(endpoint, {
      ...options,
      method: 'PUT',
      ...(serialized !== undefined ? { body: serialized } : {}),
    });
  }

  delete(
    endpoint: string,
    options?: Omit<RequestInit, 'method'>,
  ): Promise<Response> {
    return this.fetchFn(endpoint, { ...options, method: 'DELETE' });
  }

  parseErrorMessage(data: unknown, fallback: string): string {
    if (typeof data === 'object' && data !== null && 'message' in data) {
      const message = (data as { message: unknown }).message;
      if (typeof message === 'string') return message;
      if (Array.isArray(message) && typeof message[0] === 'string')
        return message[0];
    }
    return fallback;
  }
}
