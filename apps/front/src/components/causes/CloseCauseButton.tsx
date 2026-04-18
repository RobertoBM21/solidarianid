'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import { useFetchClient } from '../../lib/http/use-fetch-client';
import { closeCause } from '../../services/causes.service';

interface CloseCauseButtonProps {
  communityId: string;
  causeId: string;
}

export default function CloseCauseButton({
  communityId,
  causeId,
}: CloseCauseButtonProps) {
  const fetchClient = useFetchClient();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleCloseCause() {
    if (
      !window.confirm(
        '¿Quieres marcar esta causa como finalizada? Esta acción cerrará la causa.',
      )
    ) {
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await closeCause(communityId, causeId, fetchClient);
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'No se pudo finalizar la causa.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="d-flex flex-column align-items-stretch gap-2">
      <Button
        variant="outline-danger"
        disabled={isSubmitting}
        onClick={() => {
          void handleCloseCause();
        }}
      >
        {isSubmitting ? 'Finalizando…' : 'Marcar como finalizada'}
      </Button>

      {error ? (
        <Alert variant="danger" className="mb-0">
          {error}
        </Alert>
      ) : null}
    </div>
  );
}
