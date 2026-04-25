import { gql } from '@apollo/client';
import apolloClient from '../lib/apollo/client';
import type { ApiClient } from '../lib/http/api-client';
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

export async function getCauseById(
  id: string,
  client: ApiClient,
): Promise<CauseDetail | undefined> {
  const response = await client.get(`/causes/${id}`, { cache: 'no-store' });

  if (response.status === 404) {
    return undefined;
  }

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      client.parseErrorMessage(
        data,
        'No se pudo cargar el detalle de la causa.',
      ),
    );
  }

  return data as CauseDetail;
}

export async function getCausesByCommunityId(
  communityId: string,
  client: ApiClient,
): Promise<CauseDetail[]> {
  const community = await getCommunityById(communityId);

  if (!community) {
    return [];
  }

  const causes = await Promise.all(
    community.causes.map(async (cause) => await getCauseById(cause.id, client)),
  );

  return causes.filter((cause): cause is CauseDetail => cause !== undefined);
}

export async function createCause(
  communityId: string,
  payload: CreateCausePayload,
  client: ApiClient,
): Promise<CreateCauseResponse> {
  const response = await client.post(
    `/communities/${communityId}/causes`,
    payload,
  );

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      client.parseErrorMessage(data, 'No se pudo crear la causa.'),
    );
  }

  return data as CreateCauseResponse;
}

export async function closeCause(
  communityId: string,
  causeId: string,
  client: ApiClient,
): Promise<void> {
  const response = await client.post(
    `/communities/${communityId}/causes/${causeId}/close`,
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      client.parseErrorMessage(data, 'No se pudo finalizar la causa.'),
    );
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
    throw new Error('No se pudo apoyar la causa.');
  }
}

export async function supportCauseAnonymousUser(
  causeId: string,
  name: string,
  email: string,
  client: ApiClient,
): Promise<void> {
  const response = await client.post(
    `/causes/${causeId}/supports/create-anonymous`,
    { name, email },
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      client.parseErrorMessage(data, 'No se pudo apoyar la causa.'),
    );
  }
}

export async function cancelSupportCause(
  causeId: string,
  client: ApiClient,
): Promise<void> {
  const response = await client.delete(`/causes/${causeId}/supports`);

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      client.parseErrorMessage(
        data,
        'No se pudo cancelar el apoyo a la causa.',
      ),
    );
  }
}
