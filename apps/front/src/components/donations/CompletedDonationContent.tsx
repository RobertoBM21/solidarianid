'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardText from 'react-bootstrap/CardText';
import CardTitle from 'react-bootstrap/CardTitle';
import Container from 'react-bootstrap/Container';

function formatAmount(amount: string | null): string | null {
  if (!amount) {
    return null;
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount)) {
    return null;
  }

  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(parsedAmount);
}

export default function CompletedDonationContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const amount = formatAmount(searchParams.get('amount'));

  return (
    <main>
      <Container className="py-5" style={{ maxWidth: 720 }}>
        <Card className="border-0 shadow-sm">
          <CardBody>
            <CardTitle className="text-success">Donación completada</CardTitle>
            <p className="text-muted">
              La donación se ha registrado correctamente en la plataforma.
            </p>

            {amount ? (
              <CardText className="mb-2 text-muted">
                <strong>Importe:</strong> {amount}
              </CardText>
            ) : null}
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
