import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Container from 'react-bootstrap/Container';
import CommunityManagementPanels from '../../../../components/memberships/CommunityManagementPanels';
import { getSessionOrRedirect } from '../../../../lib/auth/get-session-or-redirect';
import { fetchServer } from '../../../../lib/http/fetch-server';
import { getCommunityById } from '../../../../services/communities.service';
import {
  getCommunityMembers,
  getCommunityMembershipRequests,
} from '../../../../services/memberships.service';

export default async function CommunityManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await getSessionOrRedirect();

  const { id } = await params;
  const community = await getCommunityById(id);

  if (!community) {
    notFound();
  }

  if (!community.isCommunityAdmin) {
    redirect(`/communities/${community.id}`);
  }

  const client = fetchServer();

  const [requests, members] = await Promise.all([
    getCommunityMembershipRequests(community.id, client),
    getCommunityMembers(community.id, client),
  ]);

  return (
    <main>
      <Container className="py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="mb-1 text-primary">Gestión de comunidad</h1>
            <p className="mb-0 text-muted">
              Gestiona las solicitudes de membresía y los miembros de la
              comunidad.
            </p>
          </div>

          <Link
            href={`/communities/${community.id}`}
            className="btn btn-outline-primary"
          >
            Volver al detalle
          </Link>
        </div>

        <CommunityManagementPanels
          communityId={community.id}
          communityName={community.name}
          communityDescription={community.description}
          communityCreatedAt={community.createdAt}
          causesCount={community.causes.length}
          initialRequests={requests}
          initialMembers={members}
        />
      </Container>
    </main>
  );
}
