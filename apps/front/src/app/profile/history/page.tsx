import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import { getSessionOrRedirect } from '../../../lib/auth/get-session-or-redirect';
import { getProfileHistory } from '../../../services/profile.service';

function getHistoryTypeLabel(
  type: 'membership' | 'support' | 'donation' | 'volunteering',
) {
  switch (type) {
    case 'membership':
      return 'Membresía';
    case 'support':
      return 'Apoyo';
    case 'donation':
      return 'Donación';
    case 'volunteering':
      return 'Voluntariado';
  }
}

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
            <Table striped bordered hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {profileHistory.map((item) => (
                  <tr key={`${item.type}-${item.date}-${item.subject}`}>
                    <td>{getHistoryTypeLabel(item.type)}</td>
                    <td>{item.subject}</td>
                    <td>{new Date(item.date).toLocaleDateString('es-ES')}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </Container>
    </main>
  );
}
