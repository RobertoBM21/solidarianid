import type { ApiClient } from '../lib/http/api-client';
import type {
  CreateDonationPayload,
  DonationResponse,
  PaymentLinkResponse,
} from '../models/donation.models';

export async function startDonation(
  payload: CreateDonationPayload,
  client: ApiClient,
): Promise<PaymentLinkResponse> {
  const response = await client.post('/donations', payload);

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      client.parseErrorMessage(data, 'No se pudo iniciar la donación.'),
    );
  }

  return data as PaymentLinkResponse;
}

export async function completeDonation(
  externalPaymentId: string,
  client: ApiClient,
): Promise<DonationResponse> {
  const response = await client.get(
    `/donations/complete/${encodeURIComponent(externalPaymentId)}`,
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      client.parseErrorMessage(data, 'No se pudo completar la donación.'),
    );
  }

  return data as DonationResponse;
}
