'use client';

import Link from 'next/link';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import { useFetchClient } from '../../lib/http/use-fetch-client';
import type {
  ProfileMembershipItem,
  ProfileMembershipStatus,
} from '../../models/profile.models';
import { leaveCommunity } from '../../services/memberships.service';

function getMembershipBadgeLabel(status: ProfileMembershipStatus) {
  switch (status) {
    case 'admin':
      return 'Administrador';
    case 'member':
      return 'Miembro';
    case 'accepted':
      return 'Aceptada';
    case 'pending':
      return 'Pendiente';
    case 'rejected':
      return 'Rechazada';
  }
}

function getMembershipBadgeVariant(status: ProfileMembershipStatus) {
  switch (status) {
    case 'admin':
      return 'primary';
    case 'member':
    case 'accepted':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'danger';
  }
}

interface ProfileMembershipListProps {
  memberships: ProfileMembershipItem[];
}

export default function ProfileMembershipList({
  memberships: initialMemberships,
}: ProfileMembershipListProps) {
  const fetchClient = useFetchClient();
  const [memberships, setMemberships] =
    useState<ProfileMembershipItem[]>(initialMemberships);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleLeave(membership: ProfileMembershipItem) {
    setLeavingId(membership.id);
    setError('');
    setMessage('');

    try {
      await leaveCommunity(membership.communityId, fetchClient);
      setMemberships((prev) => prev.filter((m) => m.id !== membership.id));
      setMessage(`Has abandonado "${membership.communityName}".`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al abandonar la comunidad.',
      );
    } finally {
      setLeavingId(null);
    }
  }

  const canLeave = (status: ProfileMembershipStatus) =>
    status === 'accepted' || status === 'member';

  return (
    <>
      {memberships.length === 0 ? (
        <p className="text-muted mb-0">No tienes membresías registradas.</p>
      ) : (
        <ListGroup variant="flush">
          {memberships.map((membership) => (
            <ListGroupItem
              key={membership.id}
              className="d-flex justify-content-between align-items-center gap-3"
            >
              <div className="d-flex align-items-center gap-2">
                <Link href={`/communities/${membership.communityId}`}>
                  {membership.communityName}
                </Link>
                <Badge bg={getMembershipBadgeVariant(membership.status)}>
                  {getMembershipBadgeLabel(membership.status)}
                </Badge>
              </div>

              {canLeave(membership.status) ? (
                <Button
                  variant="outline-danger"
                  size="sm"
                  disabled={leavingId === membership.id}
                  onClick={() => {
                    void handleLeave(membership);
                  }}
                >
                  {leavingId === membership.id ? 'Saliendo…' : 'Abandonar'}
                </Button>
              ) : null}
            </ListGroupItem>
          ))}
        </ListGroup>
      )}

      {message ? (
        <Alert variant="success" className="mt-2 mb-0">
          {message}
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="danger" className="mt-2 mb-0">
          {error}
        </Alert>
      ) : null}
    </>
  );
}
