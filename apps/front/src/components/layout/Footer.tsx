import Container from 'react-bootstrap/Container';

export default function Footer() {
  return (
    <footer className="border-top bg-body-tertiary py-3 mt-auto">
      <Container className="d-flex flex-column flex-md-row justify-content-between gap-2 small text-body-secondary">
        <span>SolidarianID</span>
        <span>MISUM 2025/26 - Grupo 2</span>
      </Container>
    </footer>
  );
}
