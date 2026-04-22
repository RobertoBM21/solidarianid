import { getServerSession } from 'next-auth';
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
import RegisterVolunteeringForm from '../../../../../components/actions/RegisterVolunteeringForm';
import StartDonationForm from '../../../../../components/actions/StartDonationForm';
import { authOptions } from '../../../../../lib/auth/auth-options';
import { fetchServer } from '../../../../../lib/http/fetch-server';
import {
  getCauseActionById,
  isFundingAction,
} from '../../../../../services/actions.service';

export const dynamic = 'force-dynamic';

export default async function ActionDetailPage({
  params,
}: {
  params: Promise<{ id: string; actionId: string }>;
}) {
  const { id, actionId } = await params;
  const [detail, session] = await Promise.all([
    getCauseActionById(id, actionId, fetchServer),
    getServerSession(authOptions),
  ]);

  if (!detail) {
    notFound();
  }

  const { action } = detail;
  const isLoggedIn = Boolean(session);
  const canDonate = isLoggedIn && isFundingAction(action) && !action.closed;
  const canParticipate =
    isLoggedIn && action.type === 'volunteering' && !action.closed;

  return (
    <main>
      <Container className="py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="mb-1 text-primary">{action.title}</h1>
            <p className="mb-0 text-muted">
              Consulta la información general de la acción solidaria.
            </p>
          </div>
          <Link
            href={`/causes/${detail.causeId}`}
            className="btn btn-outline-primary"
          >
            Volver a causa
          </Link>
        </div>
        <Card className="mb-4 border-0 shadow-sm">
          <CardBody>
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
              <CardTitle className="mb-0 text-primary">
                Información de la acción
              </CardTitle>
              <Badge bg={action.closed ? 'secondary' : 'success'}>
                {action.closed ? 'Cerrada' : 'Activa'}
              </Badge>
            </div>
            <CardText className="text-muted">{action.description}</CardText>
            <CardText className="mb-2 text-muted">
              <strong>Tipo:</strong>{' '}
              {action.type === 'funding' ? 'Financiación' : 'Voluntariado'}
            </CardText>
            <CardText className="mb-2 text-muted">
              <strong>Objetivos:</strong> {action.objectives.join(', ')}
            </CardText>
            {isFundingAction(action) ? (
              <>
                <CardText className="mb-2 text-muted">
                  <strong>Objetivo económico:</strong> {action.targetAmount} €
                </CardText>
                <CardText className="mb-2 text-muted">
                  <strong>Importe recaudado:</strong> {action.currentAmount} €
                </CardText>
              </>
            ) : (
              <>
                <CardText className="mb-2 text-muted">
                  <strong>Inicio:</strong>{' '}
                  {new Date(action.start).toLocaleString('es-ES')}
                </CardText>
                <CardText className="mb-2 text-muted">
                  <strong>Fin:</strong>{' '}
                  {new Date(action.end).toLocaleString('es-ES')}
                </CardText>
              </>
            )}
            <CardText className="mb-2 text-muted">
              <strong>Causa:</strong> {detail.causeTitle}
            </CardText>
            <CardText className="mb-0 text-muted">
              <strong>Comunidad:</strong> {detail.communityName}
            </CardText>
          </CardBody>
        </Card>
        {canDonate ? (
          <Row className="g-4">
            <Col>
              <StartDonationForm fundingActionId={action.id} />
            </Col>
          </Row>
        ) : null}
        {canParticipate && action.type === 'volunteering' ? (
          <Row className="g-4">
            <Col>
              <RegisterVolunteeringForm
                volunteeringActionId={action.id}
                start={action.start}
                end={action.end}
              />
            </Col>
          </Row>
        ) : null}
      </Container>
    </main>
  );
}
