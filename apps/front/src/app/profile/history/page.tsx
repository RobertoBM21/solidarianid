import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import Container from 'react-bootstrap/Container';
import ProfileHistoryTable from '../../../components/profile/history/ProfileHistoryTable';
import { getSessionOrRedirect } from '../../../lib/auth/get-session-or-redirect';
import { fetchServer } from '../../../lib/http/fetch-server';
import { getProfileHistory } from '../../../services/profile.service';

export default async function ProfileHistoryPage() {
  await getSessionOrRedirect();

  const profileHistory = await getProfileHistory(fetchServer());

  return (
    <main>
      <Container className="py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="mb-1 text-primary">Mi histórico de acciones</h1>
            <p className="mb-0 text-muted">
              Registro de tu actividad reciente.
            </p>
          </div>
        </div>

        <Card className="border-0 shadow" bg="body-tertiary">
          <CardBody>
            <ProfileHistoryTable initialItems={profileHistory} />
          </CardBody>
        </Card>
      </Container>
    </main>
  );
}
