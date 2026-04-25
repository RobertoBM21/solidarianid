import type { ApiClient } from '../lib/http/api-client';
import type {
  CreateVolunteerLogPayload,
  VolunteerLogResponse,
} from '../models/volunteering.models';

export async function registerVolunteerParticipation(
  payload: CreateVolunteerLogPayload,
  client: ApiClient,
): Promise<VolunteerLogResponse> {
  const response = await client.post('/volunteer-logs', payload);

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      client.parseErrorMessage(data, 'No se pudo registrar la participación.'),
    );
  }

  return data as VolunteerLogResponse;
}
