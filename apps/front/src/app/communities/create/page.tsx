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

const initialForm = {
  name: '',
  description: '',
};

export default function CreateCommunityPage() {
  const [formData, setFormData] = useState(initialForm);
  const [message, setMessage] = useState('');

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      return;
    }

    setMessage(`Se ha registrado la propuesta de comunidad "${formData.name}".`);
    setFormData(initialForm);
  }

  return (
    <main>
      <Container className="py-4">
        <Card className="border-0 shadow-sm">
          <CardBody>
            <CardTitle className="text-primary">Proponer comunidad</CardTitle>
            <p className="text-muted">
              Completa este formulario para registrar una nueva propuesta de comunidad.
            </p>

            <Form onSubmit={handleSubmit}>
              <FormGroup className="mb-3">
                <FormLabel>Nombre</FormLabel>
                <FormControl
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nombre de la comunidad"
                />
              </FormGroup>

              <FormGroup className="mb-3">
                <FormLabel>Descripción</FormLabel>
                <FormControl
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descripción breve"
                />
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
          </CardBody>
        </Card>
      </Container>
    </main>
  );
}
