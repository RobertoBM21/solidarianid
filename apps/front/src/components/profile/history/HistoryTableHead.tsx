'use client';

import type { HistoryFilter, SortKey } from './history-table.types';
import SortableHeaderButton from './SortableHeaderButton';

interface HistoryTableHeadProps {
  isAllFilter: boolean;
  activeFilter: HistoryFilter;
  onToggleSort: (key: SortKey) => void;
  getSortIndicator: (key: SortKey) => string;
}

export default function HistoryTableHead({
  isAllFilter,
  activeFilter,
  onToggleSort,
  getSortIndicator,
}: HistoryTableHeadProps) {
  return (
    <thead>
      <tr>
        {isAllFilter ? (
          <th>
            <SortableHeaderButton
              label="Tipo"
              sortKey="type"
              onToggleSort={onToggleSort}
              getSortIndicator={getSortIndicator}
            />
          </th>
        ) : null}
        <th>
          <SortableHeaderButton
            label="Descripción"
            sortKey="description"
            onToggleSort={onToggleSort}
            getSortIndicator={getSortIndicator}
          />
        </th>
        <th>
          <SortableHeaderButton
            label="Fecha"
            sortKey="date"
            onToggleSort={onToggleSort}
            getSortIndicator={getSortIndicator}
          />
        </th>
        {isAllFilter ? (
          <th>
            <SortableHeaderButton
              label="Detalles"
              sortKey="details"
              onToggleSort={onToggleSort}
              getSortIndicator={getSortIndicator}
            />
          </th>
        ) : null}
        {activeFilter === 'donation' ? (
          <th>
            <SortableHeaderButton
              label="Cantidad"
              sortKey="amount"
              onToggleSort={onToggleSort}
              getSortIndicator={getSortIndicator}
            />
          </th>
        ) : null}
        {activeFilter === 'volunteering' ? (
          <th>
            <SortableHeaderButton
              label="Fin"
              sortKey="end"
              onToggleSort={onToggleSort}
              getSortIndicator={getSortIndicator}
            />
          </th>
        ) : null}
      </tr>
    </thead>
  );
}
