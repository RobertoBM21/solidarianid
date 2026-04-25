import Link from 'next/link';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import type {
  ProfileMembershipRequestItem,
  ProfileMembershipRequestStatus,
} from '../../models/profile.models';

function getRequestBadgeLabel(status: ProfileMembershipRequestStatus) {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'rejected':
      return 'Rechazada';
  }
}

function getRequestBadgeVariant(status: ProfileMembershipRequestStatus) {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'danger';
  }
}

interface ProfileMembershipRequestListProps {
  requests: ProfileMembershipRequestItem[];
}

export default function ProfileMembershipRequestList({
  requests,
}: ProfileMembershipRequestListProps) {
  return requests.length === 0 ? (
    <p className="text-muted mb-0">
      No tienes solicitudes de membresía registradas.
    </p>
  ) : (
    <ListGroup variant="flush">
      {requests.map((request) => (
        <ListGroupItem
          key={request.id}
          className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 bg-transparent"
        >
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span>{request.communityName}</span>
            <Badge bg={getRequestBadgeVariant(request.status)}>
              {getRequestBadgeLabel(request.status)}
            </Badge>
          </div>

          <div className="d-flex gap-2">
            <Link
              href={`/communities/${request.communityId}`}
              className="btn btn-sm btn-outline-primary"
            >
              Ver comunidad
            </Link>
          </div>
        </ListGroupItem>
      ))}
    </ListGroup>
  );
}
