'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:3010';

function GoogleCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const processedCode = useRef<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setError('El acceso con Google fue denegado o cancelado.');
      return;
    }

    if (!code) {
      setError('No se recibió el código de autorización de Google.');
      return;
    }

    if (processedCode.current === code) return;
    processedCode.current = code;

    fetch(`${GATEWAY_URL}/auth/google/callback?code=${code}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Error al verificar la autenticación con Google.');
        }
        return res.json() as Promise<{ access_token: string }>;
      })
      .then((data) =>
        signIn('token', { token: data.access_token, redirect: false }),
      )
      .then((result) => {
        if (result?.error) {
          setError('Error al iniciar sesión. Inténtalo de nuevo.');
        } else {
          router.push('/');
          router.refresh();
        }
      })
      .catch((err: unknown) => {
        console.error('Error during Google callback:', err);
        setError('Error al procesar la autenticación con Google.');
      });
  }, [searchParams, router]);

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <>
      <Spinner animation="border" variant="primary" className="mb-3" />
      <p className="text-muted">Verificando autenticación con Google…</p>
    </>
  );
}

export default function GoogleCallbackPage() {
  return (
    <main>
      <Container className="py-5 text-center">
        <Suspense
          fallback={
            <>
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p className="text-muted">Cargando…</p>
            </>
          }
        >
          <GoogleCallbackHandler />
        </Suspense>
      </Container>
    </main>
  );
}
