'use client';

import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import { useFetchClient } from '../../lib/http/use-fetch-client';

interface ProfileEditFormProps {
  initialData: {
    name?: string;
    phone?: string;
    city?: string;
    country?: string;
  };
}

export default function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const fetchClient = useFetchClient();
  const [formData, setFormData] = useState({
    name: initialData.name ?? '',
    phone: initialData.phone ?? '',
    city: initialData.city ?? '',
    country: initialData.country ?? '',
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetchClient('/profile', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message ?? 'Error al actualizar el perfil.');
      }

      setMessage('Perfil actualizado correctamente.');
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al actualizar el perfil.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <Button
        variant="outline-primary"
        size="sm"
        onClick={() => {
          setEditing(true);
          setMessage('');
          setError('');
        }}
      >
        Editar datos
      </Button>
    );
  }

  return (
    <Form
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      className="mt-3"
    >
      <FormGroup className="mb-2">
        <FormLabel>Nombre</FormLabel>
        <FormControl
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Tu nombre"
        />
      </FormGroup>

      <FormGroup className="mb-2">
        <FormLabel>Teléfono</FormLabel>
        <FormControl
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Tu teléfono"
        />
      </FormGroup>

      <FormGroup className="mb-2">
        <FormLabel>Ciudad</FormLabel>
        <FormControl
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="Tu ciudad"
        />
      </FormGroup>

      <FormGroup className="mb-2">
        <FormLabel>País (código de 2 letras)</FormLabel>
        <FormControl
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="ej. es"
          maxLength={2}
        />
      </FormGroup>

      <div className="d-flex gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar'}
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => {
            setEditing(false);
          }}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>

      {message ? (
        <Alert variant="success" className="mt-2 mb-0">
          {message}
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="danger" className="mt-2 mb-0">
          {error}
        </Alert>
      ) : null}
    </Form>
  );
}
