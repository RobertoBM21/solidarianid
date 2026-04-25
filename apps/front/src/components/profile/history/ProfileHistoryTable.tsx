'use client';

import { useEffect, useMemo, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Table from 'react-bootstrap/Table';
import {
  getCachedMyCollaborations,
  saveMyCollaborations,
} from '../../../lib/pwa/collaboration-store';
import type { HistoryItem } from '../../../models/profile.models';
import HistoryFilterControls from './HistoryFilterControls';
import HistoryTableBody from './HistoryTableBody';
import HistoryTableHead from './HistoryTableHead';
import {
  getHistoryTypeLabel,
  type HistoryFilter,
  type SortConfig,
  type SortKey,
} from './history-table.types';

interface ProfileHistoryTableProps {
  initialItems: HistoryItem[];
}

export default function ProfileHistoryTable({
  initialItems,
}: ProfileHistoryTableProps) {
  const [items, setItems] = useState(initialItems);
  const [isUsingCachedData, setIsUsingCachedData] = useState(false);

  useEffect(() => {
    let isDisposed = false;

    const loadHistory = async () => {
      if (navigator.onLine) {
        await saveMyCollaborations(initialItems);

        if (!isDisposed) {
          setItems(initialItems);
          setIsUsingCachedData(false);
        }

        return;
      }

      const cachedItems = await getCachedMyCollaborations();

      if (isDisposed) {
        return;
      }

      if (cachedItems.length > 0) {
        setItems(cachedItems);
        setIsUsingCachedData(true);
        return;
      }

      setItems(initialItems);
      setIsUsingCachedData(false);
    };

    void loadHistory();

    return () => {
      isDisposed = true;
    };
  }, [initialItems]);

  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'date',
    direction: 'desc',
  });

  const filteredUserHistory = useMemo(() => {
    return activeFilter === 'all'
      ? items
      : items.filter((item) => item.type === activeFilter);
  }, [activeFilter, items]);

  function getDetails(item: HistoryItem): string {
    const details: string[] = [];

    if (typeof item.amount === 'number') {
      details.push(`cantidad: ${String(item.amount)}`);
    }

    if (item.end) {
      details.push(`fin: ${new Date(item.end).toLocaleDateString('es-ES')}`);
    }

    return details.length > 0 ? details.join(' | ') : '-';
  }

  function getSortValue(item: HistoryItem, key: SortKey): string | number {
    switch (key) {
      case 'type':
        return getHistoryTypeLabel(item.type);
      case 'description':
        return item.subject;
      case 'date':
        return new Date(item.date).getTime();
      case 'details':
        return getDetails(item);
      case 'amount':
        return item.amount ?? Number.NEGATIVE_INFINITY;
      case 'end':
        return item.end
          ? new Date(item.end).getTime()
          : Number.NEGATIVE_INFINITY;
    }
  }

  function toggleSort(key: SortKey) {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }

      return {
        key,
        direction: 'asc',
      };
    });
  }

  function getSortIndicator(key: SortKey): string {
    if (sortConfig.key !== key) {
      return '';
    }

    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  }

  const visibleUserHistory = useMemo(() => {
    return [...filteredUserHistory].sort((a, b) => {
      const left = getSortValue(a, sortConfig.key);
      const right = getSortValue(b, sortConfig.key);

      let result = 0;
      if (typeof left === 'number' && typeof right === 'number') {
        result = left - right;
      } else {
        result = String(left).localeCompare(String(right), 'es', {
          sensitivity: 'base',
          numeric: true,
        });
      }

      return sortConfig.direction === 'asc' ? result : -result;
    });
  }, [filteredUserHistory, sortConfig]);

  const isAllFilter = activeFilter === 'all';

  const columnCount = isAllFilter
    ? 4
    : activeFilter === 'support'
      ? 2
      : activeFilter === 'donation' || activeFilter === 'volunteering'
        ? 3
        : 2;

  return (
    <>
      {isUsingCachedData ? (
        <Alert variant="warning" className="mb-3">
          Mostrando el histórico guardado en este dispositivo.
        </Alert>
      ) : null}

      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
        <HistoryFilterControls
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      <Table striped bordered hover responsive className="mb-0">
        <HistoryTableHead
          isAllFilter={isAllFilter}
          activeFilter={activeFilter}
          onToggleSort={toggleSort}
          getSortIndicator={getSortIndicator}
        />
        <HistoryTableBody
          visibleUserHistory={visibleUserHistory}
          isAllFilter={isAllFilter}
          activeFilter={activeFilter}
          columnCount={columnCount}
          getDetails={getDetails}
        />
      </Table>
    </>
  );
}
