import type { HistoryItem } from '../models/profile.models';

type FetchFn = (endpoint: string, options?: RequestInit) => Promise<Response>;

interface CollaborationsResponse {
  items?: HistoryItem[];
}

function parseErrorMessage(data: unknown, fallbackMessage: string): string {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message: unknown }).message;

    if (typeof message === 'string') {
      return message;
    }

    if (Array.isArray(message) && typeof message[0] === 'string') {
      return message[0];
    }
  }

  return fallbackMessage;
}

export async function getMyCollaborations(
  fetchFn: FetchFn,
): Promise<HistoryItem[]> {
  const response = await fetchFn('/my-collaborations', {
    cache: 'no-store',
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      parseErrorMessage(data, 'No se pudo cargar el histórico de acciones.'),
    );
  }

  const body = data as CollaborationsResponse;
  return Array.isArray(body.items) ? body.items : [];
}
