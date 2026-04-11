import Link from 'next/link';
import { notFound } from 'next/navigation';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardText from 'react-bootstrap/CardText';
import CardTitle from 'react-bootstrap/CardTitle';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import Row from 'react-bootstrap/Row';
import { getCommunityById } from '../../../services/communities.service';

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const community = await getCommunityById(id);

  if (!community) {
    notFound();
  }

  const relatedCauses = community.causes;

  return (
    <main>
      <Container className="py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="mb-1 text-primary">{community.name}</h1>
            <p className="mb-0 text-muted">
              Consulta la información general y las causas asociadas a esta comunidad.
            </p>
          </div>

          <Link href={`/communities/${community.id}/management`} className="btn btn-outline-primary">
            Ir a gestión
          </Link>
        </div>

        <Row className="g-4">
          <Col md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <CardBody>
                <CardTitle className="text-primary">Información general</CardTitle>
                <CardText className="text-muted">{community.description}</CardText>
                <CardText className="mb-2 text-muted">
                  <strong>Creada:</strong>{' '}
                  {new Date(community.createdAt).toLocaleDateString('es-ES')}
                </CardText>
                <CardText className="mb-0 text-muted">
                  <strong>Causas asociadas:</strong> {relatedCauses.length}
                </CardText>
              </CardBody>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <CardBody>
                <CardTitle className="text-primary">Causas asociadas</CardTitle>
                {relatedCauses.length === 0 ? (
                  <CardText className="mb-0 text-muted">
                    Esta comunidad todavía no tiene causas registradas.
                  </CardText>
                ) : (
                  <ListGroup variant="flush">
                    {relatedCauses.map((cause) => (
                      <ListGroupItem
                        key={cause.id}
                        className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2"
                      >
                        <div>
                          <strong>{cause.title}</strong>
                          <div className="text-muted small">{cause.description}</div>
                          <div className="text-muted small">
                            Estado: {cause.closed ? 'Cerrada' : 'Activa'}
                          </div>
                        </div>

                        <Link href={`/causes/${cause.id}`} className="btn btn-sm btn-outline-primary">
                          Ver causa
                        </Link>
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
