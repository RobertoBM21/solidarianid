'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
import { createVolunteeringAction } from '../../services/actions.service';

interface CreateVolunteeringActionFormProps {
  causeId: string;
}

const MAX_TITLE_LENGTH = 255;

const initialForm = {
  title: '',
  description: '',
  objectives: '',
  start: '',
  end: '',
};

const initialFieldErrors = {
  title: '',
  description: '',
  start: '',
  end: '',
};

function parseObjectives(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseDate(value: string): Date | null {
  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export default function CreateVolunteeringActionForm({
  causeId,
}: CreateVolunteeringActionFormProps) {
  const fetchClient = useFetchClient();
  const router = useRouter();
  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
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

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = formData.title.trim();
    const description = formData.description.trim();
    const objectives = parseObjectives(formData.objectives);
    const parsedStart = parseDate(formData.start);
    const parsedEnd = parseDate(formData.end);

    const nextFieldErrors = {
      title: !title
        ? 'El título es obligatorio.'
        : title.length > MAX_TITLE_LENGTH
          ? 'El título no puede superar los 255 caracteres.'
          : '',
      description: description ? '' : 'La descripción es obligatoria.',
      start: parsedStart ? '' : 'La fecha de inicio es obligatoria.',
      end: !parsedEnd
        ? 'La fecha de fin es obligatoria.'
        : parsedStart && parsedEnd <= parsedStart
          ? 'La fecha de fin debe ser posterior al inicio.'
          : '',
    };

    setFieldErrors(nextFieldErrors);

    if (
      nextFieldErrors.title ||
      nextFieldErrors.description ||
      nextFieldErrors.start ||
      nextFieldErrors.end
    ) {
      return;
    }

    if (!parsedStart || !parsedEnd) {
      return;
    }

    setMessage('');
    setError('');
    setIsSubmitting(true);

    try {
      await createVolunteeringAction(
        causeId,
        {
          title,
          description,
          objectives,
          start: parsedStart.toISOString(),
          end: parsedEnd.toISOString(),
        },
        fetchClient,
      );

      setMessage('Acción de voluntariado creada correctamente.');
      setFormData(initialForm);
      setFieldErrors(initialFieldErrors);
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'No se pudo crear la acción de voluntariado.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-0 shadow-sm" bg="body-tertiary">
      <CardBody>
        <CardTitle className="text-primary">
          Crear acción de voluntariado
        </CardTitle>
        <p className="text-muted">
          Define una nueva acción para coordinar participación dentro de esta
          causa.
        </p>

        <Form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <FormGroup className="mb-3">
            <FormLabel>Título</FormLabel>
            <FormControl
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Título de la acción"
              maxLength={MAX_TITLE_LENGTH}
              required
              isInvalid={Boolean(fieldErrors.title)}
            />
            {fieldErrors.title ? (
              <div className="invalid-feedback d-block">
                {fieldErrors.title}
              </div>
            ) : null}
          </FormGroup>

          <FormGroup className="mb-3">
            <FormLabel>Descripción</FormLabel>
            <FormControl
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción breve de la acción"
              required
              isInvalid={Boolean(fieldErrors.description)}
            />
            {fieldErrors.description ? (
              <div className="invalid-feedback d-block">
                {fieldErrors.description}
              </div>
            ) : null}
          </FormGroup>

          <FormGroup className="mb-3">
            <FormLabel>Objetivos</FormLabel>
            <FormControl
              as="textarea"
              rows={3}
              name="objectives"
              value={formData.objectives}
              onChange={handleChange}
              placeholder="Un objetivo por línea"
            />
            <div className="form-text">
              Campo opcional. Se guardará un objetivo por cada línea no vacía.
            </div>
          </FormGroup>

          <FormGroup className="mb-3">
            <FormLabel>Inicio</FormLabel>
            <FormControl
              type="datetime-local"
              name="start"
              value={formData.start}
              onChange={handleChange}
              required
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
              min={formData.start || undefined}
              required
              isInvalid={Boolean(fieldErrors.end)}
            />
            {fieldErrors.end ? (
              <div className="invalid-feedback d-block">{fieldErrors.end}</div>
            ) : (
              <div className="form-text">
                La fecha de fin debe ser posterior al inicio.
              </div>
            )}
          </FormGroup>

          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Crear acción de voluntariado'}
          </Button>
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
