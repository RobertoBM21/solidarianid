'use client';

import Button from 'react-bootstrap/Button';
import type { SortKey } from './history-table.types';

interface SortableHeaderButtonProps {
  label: string;
  sortKey: SortKey;
  onToggleSort: (key: SortKey) => void;
  getSortIndicator: (key: SortKey) => string;
}

export default function SortableHeaderButton({
  label,
  sortKey,
  onToggleSort,
  getSortIndicator,
}: SortableHeaderButtonProps) {
  return (
    <Button
      variant="link"
      className="p-0 text-decoration-none"
      onClick={() => {
        onToggleSort(sortKey);
      }}
    >
      {label}
      {getSortIndicator(sortKey)}
    </Button>
  );
}
