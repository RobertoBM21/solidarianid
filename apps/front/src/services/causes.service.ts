import { gql } from '@apollo/client';
import apolloClient from '../lib/apollo/client';
import type {
  CauseDetail,
  CreateCausePayload,
  CreateCauseResponse,
} from '../models/cause.models';
import { getCommunityById } from './communities.service';

interface SupportCauseMutationResponse {
  registerCauseSupport: boolean;
}

const SUPPORT_CAUSE_MUTATION = gql`
  mutation registerCauseSupport($causeId: String!) {
    registerCauseSupport(causeId: $causeId)
  }
`;

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

export async function getCauseById(
  id: string,
  fetchFn: FetchFn,
): Promise<CauseDetail | undefined> {
  const response = await fetchFn(`/causes/${id}`, {
    cache: 'no-store',
  });

  if (response.status === 404) {
    return undefined;
  }

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      parseErrorMessage(data, 'No se pudo cargar el detalle de la causa.'),
    );
  }

  return data as CauseDetail;
}

export async function getCausesByCommunityId(
  communityId: string,
  fetchFn: FetchFn,
): Promise<CauseDetail[]> {
  const community = await getCommunityById(communityId);

  if (!community) {
    return [];
  }

  const causes = await Promise.all(
    community.causes.map(
      async (cause) => await getCauseById(cause.id, fetchFn),
    ),
  );

  return causes.filter((cause): cause is CauseDetail => cause !== undefined);
}

export async function createCause(
  communityId: string,
  payload: CreateCausePayload,
  fetchFn: FetchFn,
): Promise<CreateCauseResponse> {
  const response = await fetchFn(`/communities/${communityId}/causes`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, 'No se pudo crear la causa.'));
  }

  return data as CreateCauseResponse;
}

export async function closeCause(
  communityId: string,
  causeId: string,
  fetchFn: FetchFn,
): Promise<void> {
  const response = await fetchFn(
    `/communities/${communityId}/causes/${causeId}/close`,
    {
      method: 'POST',
    },
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, 'No se pudo finalizar la causa.'));
  }
}

export async function supportCause(
  causeId: string,
  accessToken: string,
): Promise<void> {
  const { data } = await apolloClient.mutate<SupportCauseMutationResponse>({
    mutation: SUPPORT_CAUSE_MUTATION,
    variables: { causeId },
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  if (!data?.registerCauseSupport) {
    throw new Error(parseErrorMessage(data, 'No se pudo apoyar la causa.'));
  }
}

export async function supportCauseAnonymousUser(
  causeId: string,
  name: string,
  email: string,
  fetchFn: FetchFn,
): Promise<void> {
  const response = await fetchFn(
    `/causes/${causeId}/supports/create-anonymous`,
    {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
      }),
    },
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, 'No se pudo apoyar la causa.'));
  }
}

export async function cancelSupportCause(
  causeId: string,
  fetchFn: FetchFn,
): Promise<void> {
  const response = await fetchFn(`/causes/${causeId}/supports`, {
    method: 'DELETE',
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      parseErrorMessage(data, 'No se pudo cancelar el apoyo a la causa.'),
    );
  }
}
