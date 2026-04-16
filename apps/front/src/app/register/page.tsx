'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { registerUser } from '../../services/auth.service';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  city: '',
  country: '',
};

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { access_token } = await registerUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        city: formData.city,
        country: formData.country,
      });

      const result = await signIn('token', {
        token: access_token,
        redirect: false,
      });

      if (result?.error) {
        setError(
          'Cuenta creada pero error al iniciar sesión. Inicia sesión manualmente.',
        );
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al crear la cuenta. Inténtalo de nuevo.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Container className="py-5" style={{ maxWidth: 520 }}>
        <Card className="border-0 shadow-sm">
          <CardBody>
            <CardTitle className="text-primary mb-4">Crear cuenta</CardTitle>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form
              onSubmit={(e) => {
                void handleSubmit(e);
              }}
            >
              <FormGroup className="mb-3">
                <FormLabel>Nombre completo</FormLabel>
                <FormControl
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Tu nombre"
                />
              </FormGroup>

              <FormGroup className="mb-3">
                <FormLabel>Email</FormLabel>
                <FormControl
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="correo@ejemplo.com"
                />
              </FormGroup>

              <FormGroup className="mb-3">
                <FormLabel>Teléfono</FormLabel>
                <FormControl
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+34 123456789"
                />
              </FormGroup>

              <FormGroup className="mb-3">
                <FormLabel>Contraseña</FormLabel>
                <FormControl
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Tu contraseña"
                />
              </FormGroup>

              <FormGroup className="mb-3">
                <FormLabel>Ciudad (opcional)</FormLabel>
                <FormControl
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Madrid"
                />
              </FormGroup>

              <FormGroup className="mb-3">
                <FormLabel>País (opcional, código ISO)</FormLabel>
                <FormControl
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="es"
                />
              </FormGroup>

              <Button
                type="submit"
                variant="primary"
                className="w-100 mb-3"
                disabled={loading}
              >
                {loading ? 'Creando cuenta…' : 'Crear cuenta'}
              </Button>
            </Form>

            <p className="text-center text-muted mt-3 mb-0">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-primary">
                Inicia sesión
              </Link>
            </p>
          </CardBody>
        </Card>
      </Container>
    </main>
  );
}
