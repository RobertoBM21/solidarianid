'use client';

import { useMemo, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardTitle from 'react-bootstrap/CardTitle';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import { useFetchClient } from '../../lib/http/use-fetch-client';
import { queueVolunteeringRegistration } from '../../lib/pwa/collaboration-store';
import { registerVolunteerParticipation } from '../../services/volunteering.service';

interface RegisterVolunteeringFormProps {
  volunteeringActionId: string;
  start: string;
  end: string;
}

const initialFieldErrors = {
  start: '',
  end: '',
};

function parseDate(value: string): Date | null {
  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('es-ES');
}

function formatDateTimeLocalInput(value: string): string {
  const date = parseDate(value);

  if (!date) {
    return '';
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  const localDate = new Date(date.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, 16);
}

export default function RegisterVolunteeringForm({
  volunteeringActionId,
  start,
  end,
}: RegisterVolunteeringFormProps) {
  const fetchClient = useFetchClient();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [formData, setFormData] = useState(() => ({
    start: formatDateTimeLocalInput(start),
    end: formatDateTimeLocalInput(end),
  }));

  const actionStart = useMemo(() => parseDate(start), [start]);
  const actionEnd = useMemo(() => parseDate(end), [end]);
  const formattedStart = useMemo(() => formatDateTime(start), [start]);
  const formattedEnd = useMemo(() => formatDateTime(end), [end]);
  const minStart = useMemo(() => formatDateTimeLocalInput(start), [start]);
  const maxEnd = useMemo(() => formatDateTimeLocalInput(end), [end]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (name in initialFieldErrors) {
      setFieldErrors((current) => ({
        ...current,
        [name]: '',
      }));
    }
  }

  async function handleSubmit(
    event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();

    const selectedStart = parseDate(formData.start);
    const selectedEnd = parseDate(formData.end);

    const nextFieldErrors = {
      start: !selectedStart
        ? 'La fecha de inicio es obligatoria.'
        : actionStart && selectedStart < actionStart
          ? 'El inicio debe estar dentro del intervalo de la acción.'
          : '',
      end: !selectedEnd
        ? 'La fecha de fin es obligatoria.'
        : selectedStart && selectedEnd <= selectedStart
          ? 'La fecha de fin debe ser posterior al inicio.'
          : actionEnd && selectedEnd > actionEnd
            ? 'El fin debe estar dentro del intervalo de la acción.'
            : '',
    };

    setFieldErrors(nextFieldErrors);
    setMessage('');
    setError('');

    if (nextFieldErrors.start || nextFieldErrors.end) {
      return;
    }

    if (!selectedStart || !selectedEnd) {
      return;
    }

    const payload = {
      volunteeringActionId,
      start: selectedStart.toISOString(),
      end: selectedEnd.toISOString(),
    };

    setIsSubmitting(true);

    try {
      if (!navigator.onLine) {
        await queueVolunteeringRegistration(payload);
        setHasRegistered(true);
        setMessage(
          'Participación guardada para sincronizarse cuando vuelva la conexión.',
        );
        return;
      }

      await registerVolunteerParticipation(payload, fetchClient);

      setHasRegistered(true);
      setMessage('Participación registrada correctamente.');
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'No se pudo registrar la participación.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardBody>
        <CardTitle className="text-primary">
          Participar en voluntariado
        </CardTitle>
        <p className="text-muted mb-2">
          Selecciona tu disponibilidad dentro del intervalo definido para esta
          acción.
        </p>
        <p className="text-muted mb-3">
          <strong>Intervalo disponible:</strong> {formattedStart} -{' '}
          {formattedEnd}
        </p>

        <Form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <FormGroup className="mb-3">
            <FormLabel>Inicio</FormLabel>
            <FormControl
              type="datetime-local"
              name="start"
              value={formData.start}
              onChange={handleChange}
              min={minStart}
              max={formData.end || maxEnd}
              required
              disabled={isSubmitting || hasRegistered}
              isInvalid={Boolean(fieldErrors.start)}
            />
            {fieldErrors.start ? (
              <div className="invalid-feedback d-block">
                {fieldErrors.start}
              </div>
            ) : null}
          </FormGroup>

          <FormGroup className="mb-3">
            <FormLabel>Fin</FormLabel>
            <FormControl
              type="datetime-local"
              name="end"
              value={formData.end}
              onChange={handleChange}
              min={formData.start || minStart}
              max={maxEnd}
              required
              disabled={isSubmitting || hasRegistered}
              isInvalid={Boolean(fieldErrors.end)}
            />
            {fieldErrors.end ? (
              <div className="invalid-feedback d-block">{fieldErrors.end}</div>
            ) : null}
          </FormGroup>

          {!hasRegistered ? (
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Participar'}
            </Button>
          ) : null}
        </Form>

        {message ? (
          <Alert variant="success" className="mt-3 mb-0">
            {message}
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="danger" className="mt-3 mb-0">
            {error}
          </Alert>
        ) : null}
      </CardBody>
    </Card>
  );
}
