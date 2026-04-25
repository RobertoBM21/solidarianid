import type { ApiClient } from '../lib/http/api-client';
import type {
  CauseActionDetail,
  CreateFundingActionPayload,
  CreateFundingActionResponse,
  CreateVolunteeringActionPayload,
  CreateVolunteeringActionResponse,
} from '../models/action.models';
import type { CauseAction, FundingAction } from '../models/cause.models';
import { getCauseById } from './causes.service';

export async function getCauseActionById(
  causeId: string,
  actionId: string,
  client: ApiClient,
): Promise<CauseActionDetail | undefined> {
  const cause = await getCauseById(causeId, client);

  if (!cause) {
    return undefined;
  }

  const action = cause.actions.find((item) => item.id === actionId);

  if (!action) {
    return undefined;
  }

  return {
    causeId: cause.id,
    causeTitle: cause.title,
    communityId: cause.communityId,
    communityName: cause.communityName,
    action,
  };
}

export function isFundingAction(action: CauseAction): action is FundingAction {
  return action.type === 'funding';
}

export async function createFundingAction(
  causeId: string,
  payload: CreateFundingActionPayload,
  client: ApiClient,
): Promise<CreateFundingActionResponse> {
  const response = await client.post(
    `/causes/${causeId}/actions/funding`,
    payload,
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      client.parseErrorMessage(
        data,
        'No se pudo crear la acción de financiación.',
      ),
    );
  }

  return data as CreateFundingActionResponse;
}

export async function createVolunteeringAction(
  causeId: string,
  payload: CreateVolunteeringActionPayload,
  client: ApiClient,
): Promise<CreateVolunteeringActionResponse> {
  const response = await client.post(
    `/causes/${causeId}/actions/volunteering`,
    payload,
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      client.parseErrorMessage(
        data,
        'No se pudo crear la acción de voluntariado.',
      ),
    );
  }

  return data as CreateVolunteeringActionResponse;
}
