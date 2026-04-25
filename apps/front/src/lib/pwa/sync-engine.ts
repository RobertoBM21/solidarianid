import type { HistoryItem } from '../../models/profile.models';
import { getMyCollaborations } from '../../services/collaboration-history.service';
import { registerVolunteerParticipation } from '../../services/volunteering.service';
import {
  getPendingActions,
  removePendingAction,
  saveMyCollaborations,
} from './collaboration-store';

type FetchFn = (endpoint: string, options?: RequestInit) => Promise<Response>;

export async function refreshMyCollaborationsCache(
  fetchFn: FetchFn,
): Promise<HistoryItem[]> {
  const collaborations = await getMyCollaborations(fetchFn);
  await saveMyCollaborations(collaborations);
  return collaborations;
}

export async function syncPendingActions(fetchFn: FetchFn): Promise<void> {
  const pendingOperations = await getPendingActions();

  for (const operation of pendingOperations) {
    if (!operation.id) {
      continue;
    }

    await registerVolunteerParticipation(operation.payload, fetchFn);
    await removePendingAction(operation.id);
  }

  await refreshMyCollaborationsCache(fetchFn);
}
