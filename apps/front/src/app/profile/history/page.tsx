import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import Container from 'react-bootstrap/Container';
import ProfileHistoryContent from '../../../components/profile/ProfileHistoryContent';
import { getSessionOrRedirect } from '../../../lib/auth/get-session-or-redirect';
import { getProfileHistory } from '../../../services/profile.service';

export default async function ProfileHistoryPage() {
  await getSessionOrRedirect();

  const profileHistory = await getProfileHistory();

  return (
    <main>
      <Container className="py-4">
        <div className="mb-4">
          <h1 className="mb-3 text-primary">Mi histórico de acciones</h1>
          <p className="mb-0 text-muted">Registro de tu actividad reciente.</p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardBody>
            <ProfileHistoryContent initialItems={profileHistory} />
          </CardBody>
        </Card>
      </Container>
    </main>
  );
}
