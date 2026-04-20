'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardTitle from 'react-bootstrap/CardTitle';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import { useFetchClient } from '../../lib/http/use-fetch-client';
import { completeDonation } from '../../services/donations.service';

interface CompletedDonationParams {
  amount: string;
  donationId: string;
}

function buildCompletedDonationUrl(params: CompletedDonationParams): string {
  const query = new URLSearchParams({
    amount: params.amount,
    donationId: params.donationId,
  });

  return `/donations/completed?${query.toString()}`;
}

export default function CompleteDonationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fetchClient = useFetchClient();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const checkoutSessionId = searchParams.get('checkoutSessionId');

  useEffect(() => {
    if (!checkoutSessionId) {
      setError(
        'No se ha recibido ningún identificador de sesión de pago válido.',
      );
      return;
    }

    setError(null);

    void completeDonation(checkoutSessionId, fetchClient)
      .then((donation) => {
        router.replace(
          buildCompletedDonationUrl({
            amount: donation.amount.toString(),
            donationId: donation.id,
          }),
        );
      })
      .catch((completionError: unknown) => {
        setError(
          completionError instanceof Error
            ? completionError.message
            : 'No se pudo completar la donación.',
        );
      });
  }, [checkoutSessionId, fetchClient, router]);

  return (
    <main>
      <Container className="py-5" style={{ maxWidth: 720 }}>
        <Card className="border-0 shadow-sm">
          <CardBody>
            <CardTitle className={error ? 'text-danger' : 'text-primary'}>
              {error
                ? 'No se pudo completar la donación'
                : 'Verificando donación'}
            </CardTitle>

            {error ? (
              <Alert variant="danger" className="mb-0">
                {error}
              </Alert>
            ) : (
              <div className="d-flex align-items-center gap-3 text-muted">
                <Spinner animation="border" size="sm" />
                <span>Estamos verificando el pago con la plataforma.</span>
              </div>
            )}
          </CardBody>
        </Card>

        <div className="d-flex flex-wrap gap-2 mt-4">
          {session ? (
            <Link href="/profile/history" className="btn btn-primary">
              Ver histórico
            </Link>
          ) : null}
          <Link href="/communities" className="btn btn-outline-primary">
            Volver a comunidades
          </Link>
        </div>
      </Container>
    </main>
  );
}
