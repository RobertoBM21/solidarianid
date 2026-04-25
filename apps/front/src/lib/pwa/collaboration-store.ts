import type { HistoryItem } from '../../models/profile.models';
import type { CreateVolunteerLogPayload } from '../../models/volunteering.models';
import {
  MY_COLLABORATIONS_STORE,
  PENDING_ACTIONS_STORE,
  add,
  clear,
  getAll,
  put,
  remove,
} from './indexed-db';

interface CachedHistoryItem extends HistoryItem {
  cacheKey: string;
}

export interface PendingVolunteeringAction {
  id?: number;
  type: 'volunteering-registration';
  payload: CreateVolunteerLogPayload;
  createdAt: string;
}

function buildHistoryCacheKey(item: HistoryItem): string {
  return [
    item.type,
    item.subject,
    item.date,
    item.causeId ?? '',
    String(item.amount ?? ''),
    item.end ?? '',
  ].join('::');
}

function toCachedHistoryItem(item: HistoryItem): CachedHistoryItem {
  return {
    ...item,
    cacheKey: buildHistoryCacheKey(item),
  };
}

export async function saveMyCollaborations(
  items: HistoryItem[],
): Promise<void> {
  await clear(MY_COLLABORATIONS_STORE);

  for (const item of items) {
    await put(MY_COLLABORATIONS_STORE, toCachedHistoryItem(item));
  }
}

export async function getCachedMyCollaborations(): Promise<HistoryItem[]> {
  const items = await getAll<CachedHistoryItem>(MY_COLLABORATIONS_STORE);

  return items.map((item) => ({
    type: item.type,
    subject: item.subject,
    causeId: item.causeId,
    date: item.date,
    amount: item.amount,
    end: item.end,
  }));
}

export async function queueVolunteeringRegistration(
  payload: CreateVolunteerLogPayload,
): Promise<void> {
  await add(PENDING_ACTIONS_STORE, {
    type: 'volunteering-registration',
    payload,
    createdAt: new Date().toISOString(),
  } satisfies PendingVolunteeringAction);
}

export async function getPendingActions(): Promise<
  PendingVolunteeringAction[]
> {
  return getAll<PendingVolunteeringAction>(PENDING_ACTIONS_STORE);
}

export async function removePendingAction(id: number): Promise<void> {
  await remove(PENDING_ACTIONS_STORE, id);
}
