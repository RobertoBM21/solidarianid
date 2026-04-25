'use client';

import { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Table from 'react-bootstrap/Table';
import {
  getCachedMyCollaborations,
  saveMyCollaborations,
} from '../../lib/pwa/collaboration-store';
import type { HistoryItem } from '../../models/profile.models';

interface ProfileHistoryContentProps {
  initialItems: HistoryItem[];
}

function getHistoryTypeLabel(
  type: 'membership' | 'support' | 'donation' | 'volunteering',
) {
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

export default function ProfileHistoryContent({
  initialItems,
}: ProfileHistoryContentProps) {
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

  return (
    <>
      {isUsingCachedData ? (
        <Alert variant="warning" className="mb-3">
          Mostrando el histórico guardado en este dispositivo.
        </Alert>
      ) : null}

      <Table striped bordered hover responsive className="mb-0">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center text-muted">
                No hay actividad registrada.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={`${item.type}-${item.date}-${item.subject}`}>
                <td>{getHistoryTypeLabel(item.type)}</td>
                <td>{item.subject}</td>
                <td>{new Date(item.date).toLocaleDateString('es-ES')}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}
