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

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:3010';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales incorrectas. Inténtalo de nuevo.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Error al iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = `${GATEWAY_URL}/auth/google`;
  }

  return (
    <main>
      <Container className="py-5" style={{ maxWidth: 480 }}>
        <Card className="border-0 shadow-sm">
          <CardBody>
            <CardTitle className="text-primary mb-4">Iniciar sesión</CardTitle>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form
              onSubmit={(e) => {
                void handleSubmit(e);
              }}
            >
              <FormGroup className="mb-3">
                <FormLabel>Email</FormLabel>
                <FormControl
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  required
                  placeholder="correo@ejemplo.com"
                />
              </FormGroup>

              <FormGroup className="mb-3">
                <FormLabel>Contraseña</FormLabel>
                <FormControl
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  required
                  placeholder="Tu contraseña"
                />
              </FormGroup>

              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
              </Button>
            </Form>

            <div className="text-center my-2 text-muted">o</div>

            <Button
              variant="outline-dark"
              className="w-100 mb-3"
              onClick={handleGoogleLogin}
            >
              Continuar con Google
            </Button>

            <p className="text-center text-muted mt-3 mb-0">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-primary">
                Regístrate
              </Link>
            </p>
          </CardBody>
        </Card>
      </Container>
    </main>
  );
}
