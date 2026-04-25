'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { useFetchClient } from '../../lib/http/use-fetch-client';
import {
  cancelSupportCause,
  supportCause,
  supportCauseAnonymousUser,
} from '../../services/causes.service';

interface SupportCauseButtonProps {
  causeId: string;
  isCauseSupported: boolean;
}

export default function SupportCauseButton({
  causeId,
  isCauseSupported,
}: SupportCauseButtonProps) {
  const fetchClient = useFetchClient();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAnonymousDialog, setShowAnonymousDialog] = useState(false);
  const [anonymousName, setAnonymousName] = useState('');
  const [anonymousEmail, setAnonymousEmail] = useState('');
  const { data: session } = useSession();

  async function submitSupport(submitSupportAction: () => Promise<void>) {
    setError('');
    setIsSubmitting(true);

    try {
      await submitSupportAction();
      setShowAnonymousDialog(false);
      setAnonymousName('');
      setAnonymousEmail('');
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'No se pudo apoyar la causa, inténtalo más tarde.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSupportCause() {
    if (session?.accessToken) {
      if (!window.confirm('¿Quieres mostrar tu apoyo a esta causa?')) {
        return;
      }

      await submitSupport(async () => {
        await supportCause(causeId, session.accessToken);
      });
    } else {
      setError('');
      setShowAnonymousDialog(true);
    }
  }

  async function handleCancelSupport() {
    if (!window.confirm('¿Quieres cancelar tu apoyo a esta causa?')) {
      return;
    }

    await submitSupport(async () => {
      await cancelSupportCause(causeId, fetchClient);
    });
  }

  async function handleAnonymousSupportSubmit() {
    const name = anonymousName.trim();
    const email = anonymousEmail.trim().toLowerCase();

    if (!name) {
      setError('Debes indicar tu nombre para apoyar esta causa.');
      return;
    }

    if (!email) {
      setError('Debes indicar tu correo electrónico para apoyar esta causa.');
      return;
    }

    if (!window.confirm('¿Quieres mostrar tu apoyo a esta causa?')) {
      return;
    }

    await submitSupport(async () => {
      await supportCauseAnonymousUser(causeId, name, email, fetchClient);
    });
  }

  return (
    <div className="d-flex flex-column align-items-stretch gap-2">
      <Button
        variant={isCauseSupported ? 'outline-warning' : 'outline-success'}
        disabled={isSubmitting}
        onClick={() => {
          if (isCauseSupported) {
            void handleCancelSupport();
          } else {
            void handleSupportCause();
          }
        }}
      >
        {isSubmitting
          ? 'Cargando...'
          : isCauseSupported
            ? 'Cancelar apoyo'
            : 'Mostrar apoyo'}
      </Button>

      {error ? (
        <Alert variant="danger" className="mb-0">
          {error}
        </Alert>
      ) : null}

      <Modal
        show={showAnonymousDialog}
        onHide={() => {
          if (!isSubmitting) {
            setShowAnonymousDialog(false);
          }
        }}
        centered
      >
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title>Mostrar apoyo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={(event) => {
              event.preventDefault();
              void handleAnonymousSupportSubmit();
            }}
          >
            <Form.Group className="mb-3" controlId="anonymousSupportName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={anonymousName}
                onChange={(event) => {
                  setAnonymousName(event.target.value);
                }}
                disabled={isSubmitting}
                required
              />
            </Form.Group>

            <Form.Group controlId="anonymousSupportEmail">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                value={anonymousEmail}
                onChange={(event) => {
                  setAnonymousEmail(event.target.value);
                }}
                disabled={isSubmitting}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowAnonymousDialog(false);
            }}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="outline-success"
            onClick={() => {
              void handleAnonymousSupportSubmit();
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Cargando...' : 'Enviar apoyo'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
