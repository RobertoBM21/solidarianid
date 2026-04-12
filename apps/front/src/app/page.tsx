import Link from 'next/link';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardText from 'react-bootstrap/CardText';
import CardTitle from 'react-bootstrap/CardTitle';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { getLatestCommunities } from '../services/communities.service';

export const dynamic = 'force-dynamic';

const featureCards = [
  {
    title: 'Comunidad global',
    description:
      'Descubre comunidades activas y consulta su información antes de decidir cómo colaborar.',
  },
  {
    title: 'Identidad verificada',
    description:
      'Sigue comunidades, causas y acciones con una estructura clara y preparada para trazabilidad.',
  },
  {
    title: 'Colaboración transparente',
    description:
      'Consulta acciones de financiación o voluntariado vinculadas a cada causa.',
  },
];

const steps = [
  {
    title: 'Explora comunidades',
    description:
      'Revisa las comunidades disponibles y consulta el contexto de cada iniciativa.',
  },
  {
    title: 'Consulta sus causas',
    description:
      'Analiza las causas asociadas y decide dónde quieres centrar tu colaboración.',
  },
  {
    title: 'Colabora en acciones',
    description:
      'Participa en acciones concretas de voluntariado o financiación según cada necesidad.',
  },
];

export default async function HomePage() {
  const latestCommunities = await getLatestCommunities();

  return (
    <main>
      <Container className="py-5">
        <section className="mb-5">
          <Row className="align-items-center g-4">
            <Col lg={7}>
              <h1 className="display-5 fw-semibold mb-3 text-primary">SolidarianID</h1>
              <p className="lead mb-4 text-muted">
                SolidarianID conecta comunidades, causas y acciones solidarias
                en un entorno de colaboración transparente.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <Link href="/communities" className="btn btn-warning btn-lg align-self-start">
                  Haz visible tu impacto.
                </Link>
              </div>
            </Col>
            <Col lg={5}>
              <Card className="h-100 border-0 shadow-sm bg-primary text-white">
                <CardBody className="p-4 p-lg-5">
                  <CardTitle className="mb-3">Un punto de partida claro</CardTitle>
                  <CardText className="mb-3 text-white-50">
                    Explora comunidades, revisa sus causas y accede a acciones
                    concretas sin perder el contexto de cada iniciativa.
                  </CardText>
                  <CardText className="mb-0 text-white-50">
                    El objetivo de esta plataforma es hacer visible la actividad
                    solidaria y facilitar la participación en cada comunidad.
                  </CardText>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </section>

        <section className="mb-5">
          <Card className="border-0 shadow-sm bg-light">
            <CardBody className="p-4 p-lg-5">
              <div className="mb-4">
                <h2 className="mb-2 text-primary">Qué puedes hacer</h2>
              </div>

              <Row className="g-4">
                {featureCards.map((feature) => (
                  <Col key={feature.title} md={6} xl={4}>
                    <Card className="h-100 border-0 shadow-sm">
                      <CardBody>
                        <CardTitle className="text-primary">{feature.title}</CardTitle>
                        <CardText className="mb-0 text-muted">
                          {feature.description}
                        </CardText>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>
        </section>

        <section className="mb-5">
          <Card className="border-0 shadow-sm bg-light">
            <CardBody className="p-4 p-lg-5">
              <div className="d-flex justify-content-between align-items-center mb-3 gap-3">
                <div>
                  <h2 className="mb-2 text-primary">Últimas comunidades creadas</h2>
                  <p className="mb-0 text-muted">
                    Consulta las comunidades incorporadas más recientemente.
                  </p>
                </div>
                <Link href="/communities" className="btn btn-outline-primary">
                  Ver todas
                </Link>
              </div>

              <Row className="g-4">
                {latestCommunities.map((community) => (
                  <Col key={community.id} md={6} lg={4}>
                    <Card className="h-100 border-0 shadow-sm">
                      <CardBody>
                        <CardTitle className="text-primary">{community.name}</CardTitle>
                        <CardText className="text-muted">{community.description}</CardText>
                        <CardText className="mb-3 text-muted">
                          <strong>Creada:</strong>{' '}
                          {new Date(community.createdAt).toLocaleDateString('es-ES')}
                        </CardText>
                        <Link href={`/communities/${community.id}`} className="btn btn-primary">
                          Ver detalle
                        </Link>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>
        </section>

        <section className="mb-5">
          <Card className="border-0 shadow-sm bg-light">
            <CardBody className="p-4 p-lg-5">
              <div className="mb-4">
                <h2 className="mb-2 text-primary">Cómo funciona</h2>
                <p className="mb-0 text-muted">
                  Un recorrido simple para encontrar una iniciativa y empezar a colaborar.
                </p>
              </div>

              <Row className="g-4">
                {steps.map((step, index) => (
                  <Col key={step.title} md={4}>
                    <Card className="h-100 border-0 shadow-sm">
                      <CardBody>
                        <div className="fw-semibold mb-2 text-warning">0{index + 1}</div>
                        <CardTitle className="text-primary">{step.title}</CardTitle>
                        <CardText className="mb-0 text-muted">
                          {step.description}
                        </CardText>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>
        </section>

        <section>
          <Card className="border-0 shadow-sm bg-primary text-white">
            <CardBody className="p-4 p-lg-5 text-center">
              <h2 className="mb-3">Empieza a colaborar con iniciativas que generan impacto real</h2>
              <p className="mb-4 text-white-50">
                Revisa las comunidades disponibles y accede a las causas y acciones asociadas a cada una de ellas.
              </p>
              <Link href="/communities" className="btn btn-light btn-lg">
                Ver comunidades
              </Link>
            </CardBody>
          </Card>
        </section>
      </Container>
    </main>
  );
}
