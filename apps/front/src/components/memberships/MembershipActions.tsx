'use client';

import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import { useFetchClient } from '../../lib/http/use-fetch-client';
import { requestMembership } from '../../services/memberships.service';

type MembershipStatus = 'none' | 'pending' | 'accepted' | 'rejected';

interface MembershipActionsProps {
  communityId: string;
  initialStatus: MembershipStatus;
}

export default function MembershipActions({
  communityId,
  initialStatus,
}: MembershipActionsProps) {
  const fetchClient = useFetchClient();
  const [status, setStatus] = useState<MembershipStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleRequestMembership() {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await requestMembership(communityId, fetchClient);
      setStatus('pending');
      setMessage('Solicitud de membresía enviada correctamente.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al solicitar membresía.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="position-relative">
      {status === 'none' ? (
        <Button
          variant="primary"
          disabled={loading}
          onClick={() => {
            void handleRequestMembership();
          }}
        >
          {loading ? 'Enviando...' : 'Solicitar membresía'}
        </Button>
      ) : null}

      {status === 'pending' ? (
        <Button variant="secondary" disabled>
          Solicitud pendiente
        </Button>
      ) : null}

      {status === 'accepted' ? (
        <Button variant="success" disabled>
          Solicitud aceptada
        </Button>
      ) : null}

      {status === 'rejected' ? (
        <Button variant="danger" disabled>
          Solicitud rechazada
        </Button>
      ) : null}

      {message ? (
        <Alert
          variant="success"
          className="mt-2 mb-0 position-absolute top-100 end-0"
          style={{ whiteSpace: 'nowrap', zIndex: 1 }}
        >
          {message}
        </Alert>
      ) : null}

      {error ? (
        <Alert
          variant="danger"
          className="mt-2 mb-0 position-absolute top-100 end-0"
          style={{ whiteSpace: 'nowrap', zIndex: 1 }}
        >
          {error}
        </Alert>
      ) : null}
    </div>
  );
}
