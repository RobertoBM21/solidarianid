import Link from 'next/link';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardText from 'react-bootstrap/CardText';
import CardTitle from 'react-bootstrap/CardTitle';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import Row from 'react-bootstrap/Row';
import { getSessionOrRedirect } from '../../lib/auth/get-session-or-redirect';
import type { ProfileMembershipStatus } from '../../models/profile.models';
import { getProfileView } from '../../services/profile.service';

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

export default async function ProfilePage() {
  const session = await getSessionOrRedirect();

  const profile = await getProfileView({
    id: session.user.id,
    email: session.user.email,
  });

  return (
    <main>
      <Container className="py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="mb-1 text-primary">Mi perfil</h1>
            <p className="mb-0 text-muted">Resumen de tu cuenta.</p>
          </div>

          <Link href="/profile/history" className="btn btn-outline-primary">
            Ver histórico
          </Link>
        </div>

        <Card className="mb-4 border-0 shadow-sm">
          <CardBody>
            {profile.name && (
              <CardTitle className="text-primary">{profile.name}</CardTitle>
            )}
            <CardText className="mb-2 text-muted">
              <strong>Correo:</strong> {profile.email}
            </CardText>
            {profile.phone && (
              <CardText className="mb-2 text-muted">
                <strong>Teléfono:</strong> {profile.phone}
              </CardText>
            )}
            {profile.city && (
              <CardText className="mb-2 text-muted">
                <strong>Ciudad:</strong> {profile.city}
              </CardText>
            )}
            {profile.country && (
              <CardText className="mb-0 text-muted">
                <strong>País:</strong> {profile.country}
              </CardText>
            )}
          </CardBody>
        </Card>

        <Row className="g-4">
          <Col md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <CardBody>
                <CardTitle className="text-primary">
                  Mis membresías y solicitudes
                </CardTitle>
                <ListGroup variant="flush">
                  {profile.memberships.map((membership) => (
                    <ListGroupItem
                      key={membership.id}
                      className="d-flex justify-content-between align-items-center gap-3"
                    >
                      <span>{membership.communityName}</span>
                      <Badge bg={getMembershipBadgeVariant(membership.status)}>
                        {getMembershipBadgeLabel(membership.status)}
                      </Badge>
                    </ListGroupItem>
                  ))}
                </ListGroup>
              </CardBody>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <CardBody>
                <CardTitle className="text-primary">
                  Mis propuestas de comunidad
                </CardTitle>
                <ListGroup variant="flush">
                  {profile.proposals.map((proposal) => (
                    <ListGroupItem
                      key={proposal.id}
                      className="d-flex justify-content-between align-items-center gap-3"
                    >
                      <span>{proposal.title}</span>
                      <Badge bg="secondary">
                        {proposal.status === 'pending'
                          ? 'Pendiente'
                          : proposal.status}
                      </Badge>
                    </ListGroupItem>
                  ))}
                </ListGroup>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
}
