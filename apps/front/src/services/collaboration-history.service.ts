import type { ApiClient } from '../lib/http/api-client';
import type { HistoryItem } from '../models/profile.models';

interface CollaborationsResponse {
  items?: HistoryItem[];
}

export async function getMyCollaborations(
  client: ApiClient,
): Promise<HistoryItem[]> {
  const response = await client.get('/my-collaborations', {
    cache: 'no-store',
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      client.parseErrorMessage(
        data,
        'No se pudo cargar el histórico de acciones.',
      ),
    );
  }

  const body = data as CollaborationsResponse;
  return Array.isArray(body.items) ? body.items : [];
}
