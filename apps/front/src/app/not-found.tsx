import Link from 'next/link';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardText from 'react-bootstrap/CardText';
import CardTitle from 'react-bootstrap/CardTitle';
import Container from 'react-bootstrap/Container';

export default function NotFound() {
  return (
    <main>
      <Container className="py-4">
        <Card className="border-0 shadow-sm">
          <CardBody>
            <CardTitle className="text-primary">No encontrado</CardTitle>
            <CardText className="text-muted">
              El recurso solicitado no ha sido encontrado.
            </CardText>
            <Link href="/communities" className="btn btn-primary">
              Volver a comunidades
            </Link>
          </CardBody>
        </Card>
      </Container>
    </main>
  );
}
