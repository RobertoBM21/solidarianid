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
import { createCause } from '../../services/causes.service';

interface CreateCauseFormProps {
  communityId: string;
}

const MAX_TITLE_LENGTH = 255;
const MAX_DURATION_LENGTH = 100;

const initialForm = {
  title: '',
  description: '',
  duration: '',
  ods: '1',
};

const initialFieldErrors = {
  title: '',
  description: '',
  duration: '',
  ods: '',
};

export default function CreateCauseForm({ communityId }: CreateCauseFormProps) {
  const fetchClient = useFetchClient();
  const router = useRouter();
  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setFieldErrors({
      ...fieldErrors,
      [name]: '',
    });
  }

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedOds = Number(formData.ods);
    const title = formData.title.trim();
    const description = formData.description.trim();
    const duration = formData.duration.trim();
    const nextFieldErrors = {
      title: !title
        ? 'El título es obligatorio.'
        : title.length > MAX_TITLE_LENGTH
          ? 'El título no puede superar los 255 caracteres.'
          : '',
      description: description ? '' : 'La descripción es obligatoria.',
      duration: !duration
        ? 'La duración es obligatoria.'
        : duration.length > MAX_DURATION_LENGTH
          ? 'La duración no puede superar los 100 caracteres.'
          : '',
      ods:
        Number.isInteger(parsedOds) && parsedOds >= 1 && parsedOds <= 17
          ? ''
          : 'El ODS debe estar entre 1 y 17.',
    };

    setFieldErrors(nextFieldErrors);

    if (
      nextFieldErrors.title ||
      nextFieldErrors.description ||
      nextFieldErrors.duration ||
      nextFieldErrors.ods
    ) {
      return;
    }

    setMessage('');
    setError('');

    try {
      const cause = await createCause(
        communityId,
        {
          title,
          description,
          duration,
          ods: parsedOds,
        },
        fetchClient,
      );

      setMessage(`Causa creada correctamente. ID: ${cause.id}`);
      setFormData(initialForm);
      setFieldErrors(initialFieldErrors);
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Error al crear la causa.',
      );
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardBody>
        <CardTitle className="text-primary">Crear causa</CardTitle>
        <p className="text-muted">
          Registra una nueva causa para esta comunidad.
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
              placeholder="Título de la causa"
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
              placeholder="Descripción breve"
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
            <FormLabel>Duración</FormLabel>
            <FormControl
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="Por ejemplo, 3 meses"
              maxLength={MAX_DURATION_LENGTH}
              required
              isInvalid={Boolean(fieldErrors.duration)}
            />
            {fieldErrors.duration ? (
              <div className="invalid-feedback d-block">
                {fieldErrors.duration}
              </div>
            ) : null}
          </FormGroup>

          <FormGroup className="mb-3">
            <FormLabel>ODS</FormLabel>
            <FormControl
              type="number"
              min={1}
              max={17}
              name="ods"
              value={formData.ods}
              onChange={handleChange}
              required
              isInvalid={Boolean(fieldErrors.ods)}
            />
            {fieldErrors.ods ? (
              <div className="invalid-feedback d-block">{fieldErrors.ods}</div>
            ) : null}
          </FormGroup>

          <Button type="submit" variant="primary">
            Crear causa
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
