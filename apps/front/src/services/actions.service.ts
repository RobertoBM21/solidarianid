import type {
  CauseActionDetail,
  CreateFundingActionPayload,
  CreateFundingActionResponse,
} from '../models/action.models';
import type { CauseAction, FundingAction } from '../models/cause.models';
import { getCauseById } from './causes.service';

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

export async function getCauseActionById(
  causeId: string,
  actionId: string,
  fetchFn: FetchFn,
): Promise<CauseActionDetail | undefined> {
  const cause = await getCauseById(causeId, fetchFn);

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
  fetchFn: FetchFn,
): Promise<CreateFundingActionResponse> {
  const response = await fetchFn(`/causes/${causeId}/actions/funding`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      parseErrorMessage(
        data,
        'No se pudo crear la acción de financiación.',
      ),
    );
  }

  return data as CreateFundingActionResponse;
}
