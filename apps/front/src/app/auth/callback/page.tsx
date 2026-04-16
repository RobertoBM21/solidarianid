'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('No se recibió un token de autenticación.');
      return;
    }

    signIn('token', { token, redirect: false })
      .then((result) => {
        if (result?.error) {
          setError('Error al procesar la autenticación. Inténtalo de nuevo.');
        } else {
          router.push('/');
          router.refresh();
        }
      })
      .catch(() => {
        setError('Error al procesar la autenticación. Inténtalo de nuevo.');
      });
  }, [searchParams, router]);

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <>
      <Spinner animation="border" variant="primary" className="mb-3" />
      <p className="text-muted">Procesando autenticación…</p>
    </>
  );
}

export default function AuthCallbackPage() {
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
          <CallbackHandler />
        </Suspense>
      </Container>
    </main>
  );
}
