'use client';

import * as isoCountries from 'i18n-iso-countries';
import esLocale from 'i18n-iso-countries/langs/es.json';
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
import { useFetchClient } from '../../lib/http/use-fetch-client';
import { registerUser } from '../../services/auth.service';

isoCountries.registerLocale(esLocale);

const countryOptions = Object.entries(isoCountries.getNames('es'))
  .map(([code, name]) => ({ code: code.toLowerCase(), name }))
  .sort((a, b) => a.name.localeCompare(b.name, 'es'));

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
  const fetchClient = useFetchClient();
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { access_token } = await registerUser(
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          city: formData.city,
          country: formData.country,
        },
        fetchClient,
      );

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
                <FormLabel>País (opcional)</FormLabel>
                <Form.Select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                >
                  <option value="">Selecciona un país...</option>
                  {countryOptions.map(({ code, name }) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </Form.Select>
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
