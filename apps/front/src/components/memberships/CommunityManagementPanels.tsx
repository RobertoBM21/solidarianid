'use client';

import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardText from 'react-bootstrap/CardText';
import CardTitle from 'react-bootstrap/CardTitle';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import { useFetchClient } from '../../lib/http/use-fetch-client';
import type {
  CommunityMember,
  MembershipRequest,
} from '../../models/community.models';
import {
  expelCommunityMember,
  getCommunityMembers,
  getCommunityMembershipRequests,
  promoteCommunityMember,
  reviewMembershipRequest,
} from '../../services/memberships.service';

interface CommunityManagementPanelsProps {
  communityId: string;
  communityName: string;
  communityDescription: string;
  communityCreatedAt: string;
  causesCount: number;
  initialRequests: MembershipRequest[];
  initialMembers: CommunityMember[];
}

export default function CommunityManagementPanels({
  communityId,
  communityName,
  communityDescription,
  communityCreatedAt,
  causesCount,
  initialRequests,
  initialMembers,
}: CommunityManagementPanelsProps) {
  const fetchClient = useFetchClient();
  const [requests, setRequests] =
    useState<MembershipRequest[]>(initialRequests);
  const [members, setMembers] = useState<CommunityMember[]>(initialMembers);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestError, setRequestError] = useState('');
  const [memberMessage, setMemberMessage] = useState('');
  const [memberError, setMemberError] = useState('');
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(
    null,
  );
  const [promotingMemberId, setPromotingMemberId] = useState<string | null>(
    null,
  );
  const [expellingMemberId, setExpellingMemberId] = useState<string | null>(
    null,
  );

  async function refreshCommunityLists() {
    const [updatedRequests, updatedMembers] = await Promise.all([
      getCommunityMembershipRequests(communityId, fetchClient),
      getCommunityMembers(communityId, fetchClient),
    ]);

    setRequests(updatedRequests);
    setMembers(updatedMembers);
  }

  async function handleReviewRequest(
    request: MembershipRequest,
    verdict: 'accepted' | 'rejected',
  ) {
    setReviewingRequestId(request.id);
    setRequestMessage('');
    setRequestError('');

    try {
      await reviewMembershipRequest(request.id, verdict, fetchClient);
      await refreshCommunityLists();
      setRequestMessage(
        verdict === 'accepted'
          ? 'Solicitud aceptada correctamente.'
          : 'Solicitud rechazada correctamente.',
      );
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : 'No se pudo revisar la solicitud.',
      );
    } finally {
      setReviewingRequestId(null);
    }
  }

  async function handlePromoteMember(member: CommunityMember) {
    setPromotingMemberId(member.id);
    setMemberMessage('');
    setMemberError('');

    try {
      const updatedMember = await promoteCommunityMember(
        member.id,
        fetchClient,
      );
      setMembers((prev) =>
        prev.map((currentMember) =>
          currentMember.id === updatedMember.id ? updatedMember : currentMember,
        ),
      );
      setMemberMessage('Miembro promocionado correctamente.');
    } catch (error) {
      setMemberError(
        error instanceof Error
          ? error.message
          : 'No se pudo promocionar al miembro.',
      );
    } finally {
      setPromotingMemberId(null);
    }
  }

  async function handleExpelMember(member: CommunityMember) {
    setExpellingMemberId(member.id);
    setMemberMessage('');
    setMemberError('');

    try {
      await expelCommunityMember(member.id, fetchClient);
      setMembers((prev) =>
        prev.filter((currentMember) => currentMember.id !== member.id),
      );
      setMemberMessage('Miembro expulsado correctamente.');
    } catch (error) {
      setMemberError(
        error instanceof Error
          ? error.message
          : 'No se pudo expulsar al miembro.',
      );
    } finally {
      setExpellingMemberId(null);
    }
  }

  return (
    <Row className="g-4">
      <Col md={5}>
        <Card className="h-100 border-0 shadow-sm">
          <CardBody>
            <CardTitle className="text-primary">
              Información de la comunidad
            </CardTitle>
            <CardText className="mb-2 text-muted">
              <strong>Nombre:</strong> {communityName}
            </CardText>
            <CardText className="mb-2 text-muted">
              <strong>Descripción:</strong> {communityDescription}
            </CardText>
            <CardText className="mb-2 text-muted">
              <strong>Creada:</strong>{' '}
              {new Date(communityCreatedAt).toLocaleDateString('es-ES')}
            </CardText>
            <CardText className="mb-2 text-muted">
              <strong>Solicitudes pendientes:</strong> {requests.length}
            </CardText>
            <CardText className="mb-2 text-muted">
              <strong>Miembros:</strong> {members.length}
            </CardText>
            <CardText className="mb-0 text-muted">
              <strong>Causas asociadas:</strong> {causesCount}
            </CardText>
          </CardBody>
        </Card>
      </Col>

      <Col md={7}>
        <Card className="h-100 border-0 shadow-sm">
          <CardBody>
            <CardTitle className="text-primary">
              Solicitudes de membresía
            </CardTitle>

            {requests.length === 0 ? (
              <CardText className="mb-0 text-muted">
                No hay solicitudes pendientes en este momento.
              </CardText>
            ) : (
              <Table striped bordered hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => {
                    const isReviewing = reviewingRequestId === request.id;

                    return (
                      <tr key={request.id}>
                        <td>{request.userId}</td>
                        <td>
                          {new Date(request.createdAt).toLocaleDateString(
                            'es-ES',
                          )}
                        </td>
                        <td className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-success"
                            disabled={isReviewing}
                            onClick={() => {
                              void handleReviewRequest(request, 'accepted');
                            }}
                          >
                            {isReviewing ? 'Procesando...' : 'Aceptar'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            disabled={isReviewing}
                            onClick={() => {
                              void handleReviewRequest(request, 'rejected');
                            }}
                          >
                            {isReviewing ? 'Procesando...' : 'Rechazar'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}

            {requestMessage ? (
              <Alert variant="success" className="mt-3 mb-0">
                {requestMessage}
              </Alert>
            ) : null}

            {requestError ? (
              <Alert variant="danger" className="mt-3 mb-0">
                {requestError}
              </Alert>
            ) : null}
          </CardBody>
        </Card>
      </Col>

      <Col xs={12}>
        <Card className="border-0 shadow-sm">
          <CardBody>
            <CardTitle className="text-primary">Gestión de miembros</CardTitle>

            {members.length === 0 ? (
              <CardText className="mb-0 text-muted">
                Esta comunidad todavía no tiene miembros registrados.
              </CardText>
            ) : (
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
                        {member.role === 'admin' ? 'Administrador' : 'Miembro'}
                      </td>
                      <td>
                        {member.role === 'admin' ? null : (
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              disabled={promotingMemberId === member.id}
                              onClick={() => {
                                void handlePromoteMember(member);
                              }}
                            >
                              {promotingMemberId === member.id
                                ? 'Promoviendo...'
                                : 'Promover'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              disabled={expellingMemberId === member.id}
                              onClick={() => {
                                void handleExpelMember(member);
                              }}
                            >
                              {expellingMemberId === member.id
                                ? 'Expulsando...'
                                : 'Expulsar'}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            {memberMessage ? (
              <Alert variant="success" className="mt-3 mb-0">
                {memberMessage}
              </Alert>
            ) : null}

            {memberError ? (
              <Alert variant="danger" className="mt-3 mb-0">
                {memberError}
              </Alert>
            ) : null}
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
}
