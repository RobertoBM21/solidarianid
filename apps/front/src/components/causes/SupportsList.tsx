'use client';

import { gql } from '@apollo/client';
import { useSubscription } from '@apollo/client/react';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardTitle from 'react-bootstrap/CardTitle';
import ListGroup from 'react-bootstrap/ListGroup';

interface CauseSupportRegisteredItem {
  userId: string;
  userName: string;
  registeredAt: string;
}

interface CauseSupportRegisteredSubscriptionResponse {
  causeSupportRegistered: CauseSupportRegisteredItem;
}

interface SupportsListProps {
  causeId: string;
  maxItems?: number;
}

const CAUSE_SUPPORT_REGISTERED = gql`
  subscription CauseSupportRegistered($causeId: String) {
    causeSupportRegistered(causeId: $causeId) {
      userId
      userName
      registeredAt
    }
  }
`;

function formatSupportDate(registeredAt: string): string {
  return new Date(registeredAt).toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function SupportsList({
  causeId,
  maxItems = 5,
}: SupportsListProps) {
  const [supports, setSupports] = useState<CauseSupportRegisteredItem[]>([]);

  const { error } = useSubscription<CauseSupportRegisteredSubscriptionResponse>(
    CAUSE_SUPPORT_REGISTERED,
    {
      variables: { causeId },
      onData: ({ data }) => {
        const support = data.data?.causeSupportRegistered;

        if (!support) {
          return;
        }

        setSupports((current) => {
          const next = [
            support,
            ...current.filter(
              (item) =>
                item.userId !== support.userId ||
                item.registeredAt !== support.registeredAt,
            ),
          ];

          return next.slice(0, maxItems);
        });
      },
    },
  );

  return (
    <Card className="border-0 shadow-sm h-100" bg="body-tertiary">
      <CardBody>
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <CardTitle className="mb-0 text-primary">Últimos apoyos</CardTitle>
          <Badge bg="secondary">{supports.length}</Badge>
        </div>

        {error ? (
          <Alert variant="danger" className="mb-3">
            No se pudieron cargar los apoyos en tiempo real.
          </Alert>
        ) : null}

        {supports.length === 0 && !error ? (
          <p className="mb-0 text-muted">Esperando apoyos nuevos...</p>
        ) : null}

        {supports.length > 0 ? (
          <ListGroup variant="flush" className="border-top">
            {supports.map((support) => (
              <ListGroup.Item
                key={`${support.userId}-${support.registeredAt}`}
                className="px-0"
              >
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <div className="fw-semibold text-primary">
                      {support.userName}
                    </div>
                    <div className="text-muted small">Apoyo registrado</div>
                  </div>
                  <div className="text-muted small text-end">
                    {formatSupportDate(support.registeredAt)}
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : null}
      </CardBody>
    </Card>
  );
}
