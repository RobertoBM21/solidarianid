import type { HistoryItem } from '../../../models/profile.models';

export type HistoryFilter = 'all' | HistoryItem['type'];
export type SortDirection = 'asc' | 'desc';
export type SortKey =
  | 'type'
  | 'description'
  | 'date'
  | 'details'
  | 'amount'
  | 'end';

export interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export const filterOptions: { value: HistoryFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'membership', label: 'Membresía' },
  { value: 'support', label: 'Apoyo' },
  { value: 'donation', label: 'Donación' },
  { value: 'volunteering', label: 'Voluntariado' },
];

export function getHistoryTypeLabel(type: HistoryItem['type']) {
  switch (type) {
    case 'membership':
      return 'Membresía';
    case 'support':
      return 'Apoyo';
    case 'donation':
      return 'Donación';
    case 'volunteering':
      return 'Voluntariado';
  }
}
