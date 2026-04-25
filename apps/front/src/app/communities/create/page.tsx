'use client';

import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardTitle from 'react-bootstrap/CardTitle';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import { useFetchClient } from '../../../lib/http/use-fetch-client';
import { createCommunityProposal } from '../../../services/communities.service';

const initialForm = {
  name: '',
  description: '',
};

const initialFieldErrors = {
  name: '',
  description: '',
};

export default function CreateCommunityPage() {
  const fetchClient = useFetchClient();
  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
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

    const nextFieldErrors = {
      name: formData.name.trim() ? '' : 'El nombre es obligatorio.',
      description: formData.description.trim()
        ? ''
        : 'La descripción es obligatoria.',
    };

    setFieldErrors(nextFieldErrors);

    if (nextFieldErrors.name || nextFieldErrors.description) {
      return;
    }

    setMessage('');
    setError('');

    try {
      await createCommunityProposal(formData, fetchClient);
      setMessage('Se ha registrado la propuesta de comunidad.');
      setFormData(initialForm);
      setFieldErrors(initialFieldErrors);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Error al enviar la propuesta.',
      );
    }
  }

  return (
    <main>
      <Container className="py-4">
        <Card className="border-0 shadow-sm" bg="body-tertiary">
          <CardBody>
            <CardTitle className="text-primary">Proponer comunidad</CardTitle>
            <p className="text-muted">
              Completa este formulario para registrar una nueva propuesta de
              comunidad.
            </p>

            <Form
              onSubmit={(event) => {
                void handleSubmit(event);
              }}
            >
              <FormGroup className="mb-3">
                <FormLabel>Nombre</FormLabel>
                <FormControl
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nombre de la comunidad"
                  required
                  isInvalid={Boolean(fieldErrors.name)}
                />
                {fieldErrors.name ? (
                  <div className="invalid-feedback d-block">
                    {fieldErrors.name}
                  </div>
                ) : null}
              </FormGroup>

              <FormGroup className="mb-3">
                <FormLabel>Descripción</FormLabel>
                <FormControl
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

              <Button type="submit" variant="primary">
                Enviar propuesta
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
      </Container>
    </main>
  );
}
