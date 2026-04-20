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
import { createFundingAction } from '../../services/actions.service';

interface CreateFundingActionFormProps {
  causeId: string;
}

const MAX_TITLE_LENGTH = 255;

const initialForm = {
  title: '',
  description: '',
  objectives: '',
  targetAmount: '',
};

const initialFieldErrors = {
  title: '',
  description: '',
  targetAmount: '',
};

function parseObjectives(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function CreateFundingActionForm({
  causeId,
}: CreateFundingActionFormProps) {
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
    const parsedTargetAmount = Number(formData.targetAmount);

    const nextFieldErrors = {
      title: !title
        ? 'El título es obligatorio.'
        : title.length > MAX_TITLE_LENGTH
          ? 'El título no puede superar los 255 caracteres.'
          : '',
      description: description ? '' : 'La descripción es obligatoria.',
      targetAmount:
        Number.isFinite(parsedTargetAmount) && parsedTargetAmount > 0
          ? ''
          : 'El objetivo económico debe ser mayor que cero.',
    };

    setFieldErrors(nextFieldErrors);

    if (
      nextFieldErrors.title ||
      nextFieldErrors.description ||
      nextFieldErrors.targetAmount
    ) {
      return;
    }

    setMessage('');
    setError('');
    setIsSubmitting(true);

    try {
      await createFundingAction(
        causeId,
        {
          title,
          description,
          objectives,
          targetAmount: parsedTargetAmount,
        },
        fetchClient,
      );

      setMessage('Acción de financiación creada correctamente.');
      setFormData(initialForm);
      setFieldErrors(initialFieldErrors);
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'No se pudo crear la acción de financiación.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardBody>
        <CardTitle className="text-primary">
          Crear acción de financiación
        </CardTitle>
        <p className="text-muted">
          Define una nueva acción para recaudar fondos dentro de esta causa.
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
            <FormLabel>Objetivo económico</FormLabel>
            <FormControl
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleChange}
              placeholder="Por ejemplo, 500"
              required
              isInvalid={Boolean(fieldErrors.targetAmount)}
            />
            {fieldErrors.targetAmount ? (
              <div className="invalid-feedback d-block">
                {fieldErrors.targetAmount}
              </div>
            ) : (
              <div className="form-text">Importe objetivo en euros.</div>
            )}
          </FormGroup>

          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creando…' : 'Crear acción de financiación'}
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
