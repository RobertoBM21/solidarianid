'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import Collapse from 'react-bootstrap/Collapse';
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

const odsOptions = [
  { value: 1, label: '1 - Fin de la pobreza' },
  { value: 2, label: '2 - Hambre cero' },
  { value: 3, label: '3 - Salud y bienestar' },
  { value: 4, label: '4 - Educación de calidad' },
  { value: 5, label: '5 - Igualdad de género' },
  { value: 6, label: '6 - Agua limpia y saneamiento' },
  { value: 7, label: '7 - Energía asequible y no contaminante' },
  { value: 8, label: '8 - Trabajo decente y crecimiento económico' },
  { value: 9, label: '9 - Industria, innovación e infraestructura' },
  { value: 10, label: '10 - Reducción de las desigualdades' },
  { value: 11, label: '11 - Ciudades y comunidades sostenibles' },
  { value: 12, label: '12 - Producción y consumo responsables' },
  { value: 13, label: '13 - Acción por el clima' },
  { value: 14, label: '14 - Vida submarina' },
  { value: 15, label: '15 - Vida de ecosistemas terrestres' },
  { value: 16, label: '16 - Paz, justicia e instituciones sólidas' },
  { value: 17, label: '17 - Alianzas para lograr los objetivos' },
];

const initialForm = {
  title: '',
  description: '',
  duration: '',
  ods: '',
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
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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
      await createCause(
        communityId,
        {
          title,
          description,
          duration,
          ods: parsedOds,
        },
        fetchClient,
      );

      setMessage('Causa creada correctamente.');
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
    <Card className="border-0 shadow" bg="body-tertiary">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 text-primary">Crear causa</h5>
            <p className="mb-0 text-muted small">
              Registra una nueva causa para esta comunidad.
            </p>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => {
              setOpen((prev) => !prev);
            }}
            aria-expanded={open}
          >
            {open ? 'Ocultar formulario' : 'Añadir causa'}
          </Button>
        </div>

        <Collapse in={open}>
          <div>
            <hr className="mt-3 mb-3" />
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
                <Form.Select
                  name="ods"
                  value={formData.ods}
                  onChange={handleChange}
                  isInvalid={Boolean(fieldErrors.ods)}
                >
                  <option value="" disabled>
                    Selecciona un ODS...
                  </option>
                  {odsOptions.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Form.Select>
                {fieldErrors.ods ? (
                  <div className="invalid-feedback d-block">
                    {fieldErrors.ods}
                  </div>
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
          </div>
        </Collapse>
      </CardBody>
    </Card>
  );
}
