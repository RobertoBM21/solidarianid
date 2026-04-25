'use client';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { filterOptions, type HistoryFilter } from './history-table.types';

interface HistoryFilterControlsProps {
  activeFilter: HistoryFilter;
  onFilterChange: (filter: HistoryFilter) => void;
}

export default function HistoryFilterControls({
  activeFilter,
  onFilterChange,
}: HistoryFilterControlsProps) {
  return (
    <div>
      <div className="small text-muted mb-2">Filtrar por tipo</div>
      <ButtonGroup aria-label="Filtros del histórico" className="flex-wrap gap-2">
        {filterOptions.map((option) => {
          const isActive = activeFilter === option.value;

          return (
            <Button
              key={option.value}
              size="sm"
              variant={isActive ? 'primary' : 'outline-primary'}
              onClick={() => {
                onFilterChange(option.value);
              }}
            >
              {option.label}
            </Button>
          );
        })}
      </ButtonGroup>
    </div>
  );
}
