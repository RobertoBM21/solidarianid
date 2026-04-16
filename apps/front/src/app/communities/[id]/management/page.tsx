import Link from 'next/link';
import { notFound } from 'next/navigation';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardText from 'react-bootstrap/CardText';
import CardTitle from 'react-bootstrap/CardTitle';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import { getSessionOrRedirect } from '../../../../lib/auth/get-session-or-redirect';
import {
  getCommunityById,
  getCommunityMembers,
} from '../../../../services/communities.service';

export default async function CommunityManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSessionOrRedirect();

  const { id } = await params;
  const community = await getCommunityById(id);

  if (!community) {
    notFound();
  }

  const members = await getCommunityMembers(community.id);

  return (
    <main>
      <Container className="py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="mb-1 text-primary">Gestión de comunidad</h1>
            <p className="mb-0 text-muted">
              Gestiona la información y los miembros de la comunidad.
            </p>
          </div>

          <Link
            href={`/communities/${community.id}`}
            className="btn btn-outline-primary"
          >
            Volver al detalle
          </Link>
        </div>

        <Row className="g-4">
          <Col md={5}>
            <Card className="h-100 border-0 shadow-sm">
              <CardBody>
                <CardTitle className="text-primary">
                  Información de la comunidad
                </CardTitle>
                <CardText className="mb-2 text-muted">
                  <strong>Nombre:</strong> {community.name}
                </CardText>
                <CardText className="mb-2 text-muted">
                  <strong>Descripción:</strong> {community.description}
                </CardText>
                <CardText className="mb-2 text-muted">
                  <strong>Creada:</strong>{' '}
                  {new Date(community.createdAt).toLocaleDateString('es-ES')}
                </CardText>
                <CardText className="mb-2 text-muted">
                  <strong>Miembros:</strong> {members.length}
                </CardText>
                <CardText className="mb-0 text-muted">
                  <strong>Causas asociadas:</strong> {community.causes.length}
                </CardText>
              </CardBody>
            </Card>
          </Col>

          <Col md={7}>
            <Card className="h-100 border-0 shadow-sm">
              <CardBody>
                <CardTitle className="text-primary">
                  Gestión de miembros
                </CardTitle>
                <Table striped bordered hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Rol</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id}>
                        <td>{member.userId}</td>
                        <td>
                          {member.role === 'admin'
                            ? 'Administrador'
                            : 'Miembro'}
                        </td>
                        <td className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            disabled={member.role === 'admin'}
                          >
                            Promover
                          </Button>
                          <Button size="sm" variant="outline-danger" disabled>
                            Expulsar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
}
