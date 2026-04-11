import Container from 'react-bootstrap/Container';

export default function Footer() {
  return (
    <footer className="border-top bg-white py-3 mt-auto">
      <Container className="d-flex flex-column flex-md-row justify-content-between gap-2 small text-muted">
        <span>SolidarianID</span>
        <span>MISUM 2025/26 - Grupo 2</span>
      </Container>
    </footer>
  );
}
