'use client';

import type { HistoryItem } from '../../../models/profile.models';
import { getHistoryTypeLabel, type HistoryFilter } from './history-table.types';

interface HistoryTableBodyProps {
  visibleUserHistory: HistoryItem[];
  isAllFilter: boolean;
  activeFilter: HistoryFilter;
  columnCount: number;
  getDetails: (item: HistoryItem) => string;
}

export default function HistoryTableBody({
  visibleUserHistory,
  isAllFilter,
  activeFilter,
  columnCount,
  getDetails,
}: HistoryTableBodyProps) {
  return (
    <tbody>
      {visibleUserHistory.length > 0 ? (
        visibleUserHistory.map((item) => (
          <tr key={`${item.type}-${item.date}-${item.subject}`}>
            {isAllFilter ? <td>{getHistoryTypeLabel(item.type)}</td> : null}
            <td>{item.subject}</td>
            <td>{new Date(item.date).toLocaleDateString('es-ES')}</td>
            {isAllFilter ? <td>{getDetails(item)}</td> : null}
            {activeFilter === 'donation' ? <td>{item.amount ?? '-'}</td> : null}
            {activeFilter === 'volunteering' ? (
              <td>
                {item.end
                  ? new Date(item.end).toLocaleDateString('es-ES')
                  : '-'}
              </td>
            ) : null}
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={columnCount} className="text-center text-muted py-4">
            No hay acciones para el filtro seleccionado.
          </td>
        </tr>
      )}
    </tbody>
  );
}
