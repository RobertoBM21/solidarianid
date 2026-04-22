import type {
  CreateVolunteerLogPayload,
  VolunteerLogResponse,
} from '../models/volunteering.models';

type FetchFn = (endpoint: string, options?: RequestInit) => Promise<Response>;

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

export async function registerVolunteerParticipation(
  payload: CreateVolunteerLogPayload,
  fetchFn: FetchFn,
): Promise<VolunteerLogResponse> {
  const response = await fetchFn('/volunteer-logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      parseErrorMessage(data, 'No se pudo registrar la participación.'),
    );
  }

  return data as VolunteerLogResponse;
}
