import * as isoCountries from 'i18n-iso-countries';
import esLocale from 'i18n-iso-countries/langs/es.json';
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
import ProfileMembershipList from '../../components/memberships/ProfileMembershipList';
import ProfileMembershipRequestList from '../../components/memberships/ProfileMembershipRequestList';
import ProfileEditForm from '../../components/profile/ProfileEditForm';
import { getSessionOrRedirect } from '../../lib/auth/get-session-or-redirect';
import { fetchServer } from '../../lib/http/fetch-server';
import type { ProfileView } from '../../models/profile.models';
import { getProfileView } from '../../services/profile.service';

isoCountries.registerLocale(esLocale);

function getCountryName(code: string): string {
  const name = isoCountries.getName(code.toUpperCase(), 'es');
  return typeof name === 'string' ? name : code;
}

function getProposalBadgeVariant(status: string) {
  switch (status) {
    case 'accepted':
      return 'success';
    case 'rejected':
      return 'danger';
    default:
      return 'warning';
  }
}

function getProposalBadgeLabel(status: string) {
  switch (status) {
    case 'accepted':
      return 'Aceptada';
    case 'rejected':
      return 'Rechazada';
    default:
      return 'Pendiente';
  }
}

export default async function ProfilePage() {
  const session = await getSessionOrRedirect();

  const profile: ProfileView = await getProfileView(
    { id: session.user.id, email: session.user.email },
    fetchServer(),
  );

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

        <Card className="mb-4 border-0 shadow" bg="body-tertiary">
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
                <strong>País:</strong> {getCountryName(profile.country)}
              </CardText>
            )}
            <ProfileEditForm
              initialData={{
                name: profile.name,
                phone: profile.phone,
                city: profile.city,
                country: profile.country,
              }}
            />
          </CardBody>
        </Card>

        <Row className="g-4">
          <Col md={6}>
            <div className="d-flex flex-column gap-4">
              <Card className="border-0 shadow-sm" bg="body-tertiary">
                <CardBody>
                  <CardTitle className="text-primary">Mis membresías</CardTitle>
                  <ProfileMembershipList memberships={profile.memberships} />
                </CardBody>
              </Card>

              <Card className="border-0 shadow-sm" bg="body-tertiary">
                <CardBody>
                  <CardTitle className="text-primary">
                    Mis solicitudes de membresía
                  </CardTitle>
                  <ProfileMembershipRequestList
                    requests={profile.membershipRequests}
                  />
                </CardBody>
              </Card>
            </div>
          </Col>

          <Col md={6}>
            <Card className="h-100 border-0 shadow-sm" bg="body-tertiary">
              <CardBody>
                <CardTitle className="text-primary">
                  Mis propuestas de comunidad
                </CardTitle>
                {profile.proposals.length === 0 ? (
                  <p className="text-muted mb-0">
                    No tienes propuestas registradas.
                  </p>
                ) : (
                  <ListGroup variant="flush">
                    {profile.proposals.map((proposal) => (
                      <ListGroupItem
                        key={proposal.id}
                        className="d-flex justify-content-between align-items-center gap-3 bg-transparent"
                      >
                        <span>{proposal.title}</span>
                        <Badge bg={getProposalBadgeVariant(proposal.status)}>
                          {getProposalBadgeLabel(proposal.status)}
                        </Badge>
                      </ListGroupItem>
                    ))}
                  </ListGroup>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
}
