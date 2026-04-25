import type { HistoryItem } from '../../models/profile.models';
import { getMyCollaborations } from '../../services/collaboration-history.service';
import { registerVolunteerParticipation } from '../../services/volunteering.service';
import type { ApiClient } from '../http/api-client';
import {
  getPendingActions,
  removePendingAction,
  saveMyCollaborations,
} from './collaboration-store';

export async function refreshMyCollaborationsCache(
  client: ApiClient,
): Promise<HistoryItem[]> {
  const collaborations = await getMyCollaborations(client);
  await saveMyCollaborations(collaborations);
  return collaborations;
}

export async function syncPendingActions(client: ApiClient): Promise<void> {
  const pendingOperations = await getPendingActions();

  for (const operation of pendingOperations) {
    if (!operation.id) {
      continue;
    }

    await registerVolunteerParticipation(operation.payload, client);
    await removePendingAction(operation.id);
  }

  await refreshMyCollaborationsCache(client);
}
