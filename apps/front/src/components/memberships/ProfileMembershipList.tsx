import Link from 'next/link';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import type { ProfileMembershipItem } from '../../models/profile.models';

interface ProfileMembershipListProps {
  memberships: ProfileMembershipItem[];
}

export default function ProfileMembershipList({
  memberships,
}: ProfileMembershipListProps) {
  return memberships.length === 0 ? (
    <p className="text-muted mb-0">No tienes membresías registradas.</p>
  ) : (
    <ListGroup variant="flush">
      {memberships.map((membership) => (
        <ListGroupItem
          key={membership.id}
          className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3"
        >
          <span>{membership.communityName}</span>

          <div className="d-flex gap-2">
            <Link
              href={`/communities/${membership.communityId}`}
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
