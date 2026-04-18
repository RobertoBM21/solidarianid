import Link from 'next/link';
import { notFound } from 'next/navigation';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardText from 'react-bootstrap/CardText';
import CardTitle from 'react-bootstrap/CardTitle';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import CloseCauseButton from '../../../components/causes/CloseCauseButton';
import { fetchServer } from '../../../lib/http/fetch-server';
import { getCauseById } from '../../../services/causes.service';

export default async function CauseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cause = await getCauseById(id, fetchServer);

  if (!cause) {
    notFound();
  }

  const canCloseCause = Boolean(cause.isCommunityAdmin && !cause.closed);

  return (
    <main>
      <Container className="py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="mb-1 text-primary">{cause.title}</h1>
            <p className="mb-0 text-muted">
              Información general y acciones asociadas a la causa.
            </p>
          </div>

          <div className="d-flex flex-column flex-sm-row align-items-stretch gap-2">
            {canCloseCause ? (
              <CloseCauseButton
                communityId={cause.communityId}
                causeId={cause.id}
              />
            ) : null}
            <Link
              href={'/communities/' + cause.communityId}
              className="btn btn-outline-primary"
            >
              Volver a comunidad
            </Link>
          </div>
        </div>

        <Card className="mb-4 border-0 shadow-sm">
          <CardBody>
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
              <CardTitle className="mb-0 text-primary">
                Información de la causa
              </CardTitle>
              <Badge bg={cause.closed ? 'secondary' : 'success'}>
                {cause.closed ? 'Cerrada' : 'Activa'}
              </Badge>
            </div>

            <CardText className="text-muted">{cause.description}</CardText>
            <CardText className="mb-2 text-muted">
              <strong>Duración:</strong> {cause.duration}
            </CardText>
            <CardText className="mb-2 text-muted">
              <strong>ODS:</strong> {cause.ods}
            </CardText>
            <CardText className="mb-2 text-muted">
              <strong>Apoyo registrado:</strong>{' '}
              {cause.supportedByUser ? 'Sí' : 'No'}
            </CardText>
            <CardText className="mb-0 text-muted">
              <strong>Comunidad:</strong> {cause.communityName}
            </CardText>
          </CardBody>
        </Card>

        <h2 className="mb-3 text-primary">Acciones asociadas</h2>
        {cause.actions.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardBody>
              <CardText className="mb-0 text-muted">
                Esta causa todavía no tiene acciones registradas.
              </CardText>
            </CardBody>
          </Card>
        ) : (
          <Row className="g-4">
            {cause.actions.map((action) => (
              <Col key={action.id} md={6}>
                <Card className="h-100 border-0 shadow-sm">
                  <CardBody>
                    <CardTitle className="text-primary">
                      {action.title}
                    </CardTitle>
                    <CardText className="text-muted">
                      {action.description}
                    </CardText>
                    <CardText className="mb-2 text-muted">
                      <strong>Tipo:</strong>{' '}
                      {action.type === 'funding'
                        ? 'Financiación'
                        : 'Voluntariado'}
                    </CardText>
                    <CardText className="mb-2 text-muted">
                      <strong>Objetivos:</strong> {action.objectives.join(', ')}
                    </CardText>
                    {action.type === 'funding' ? (
                      <>
                        <CardText className="mb-2 text-muted">
                          <strong>Objetivo económico:</strong>{' '}
                          {action.targetAmount} €
                        </CardText>
                        <CardText className="mb-0 text-muted">
                          <strong>Importe recaudado:</strong>{' '}
                          {action.currentAmount} €
                        </CardText>
                      </>
                    ) : (
                      <>
                        <CardText className="mb-2 text-muted">
                          <strong>Inicio:</strong>{' '}
                          {new Date(action.start).toLocaleString('es-ES')}
                        </CardText>
                        <CardText className="mb-0 text-muted">
                          <strong>Fin:</strong>{' '}
                          {new Date(action.end).toLocaleString('es-ES')}
                        </CardText>
                      </>
                    )}
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </main>
  );
}
