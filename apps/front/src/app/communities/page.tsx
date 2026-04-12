import Link from 'next/link';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardText from 'react-bootstrap/CardText';
import CardTitle from 'react-bootstrap/CardTitle';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { getCommunities } from '../../services/communities.service';

export const dynamic = 'force-dynamic';

export default async function CommunitiesPage() {
  const communities = await getCommunities();

  return (
    <main>
      <Container className="py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="mb-1 text-primary">Comunidades</h1>
            <p className="mb-0 text-muted">Explora las comunidades disponibles.</p>
          </div>

          <Link href="/communities/create" className="btn btn-primary">
            Proponer comunidad
          </Link>
        </div>

        <Row className="g-4">
          {communities.map((community) => (
            <Col key={community.id} md={6}>
              <Card className="h-100 border-0 shadow-sm">
                <CardBody className="d-flex flex-column gap-2">
                  <CardTitle className="mb-0 text-primary">{community.name}</CardTitle>

                  <CardText className="text-muted">{community.description}</CardText>
                  <CardText className="mb-3 text-muted">
                    <strong>Creada:</strong>{' '}
                    {new Date(community.createdAt).toLocaleDateString('es-ES')}
                  </CardText>

                  <div className="d-flex gap-2 mt-auto">
                    <Link href={`/communities/${community.id}`} className="btn btn-primary">
                      Ver detalle
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </main>
  );
}
