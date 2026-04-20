import type {
  CreateDonationPayload,
  DonationResponse,
  PaymentLinkResponse,
} from '../models/donation.models';

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

export async function startDonation(
  payload: CreateDonationPayload,
  fetchFn: FetchFn,
): Promise<PaymentLinkResponse> {
  const response = await fetchFn('/donations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, 'No se pudo iniciar la donación.'));
  }

  return data as PaymentLinkResponse;
}

export async function completeDonation(
  externalPaymentId: string,
  fetchFn: FetchFn,
): Promise<DonationResponse> {
  const response = await fetchFn(
    `/donations/complete/${encodeURIComponent(externalPaymentId)}`,
    {
      method: 'GET',
    },
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      parseErrorMessage(data, 'No se pudo completar la donación.'),
    );
  }

  return data as DonationResponse;
}
