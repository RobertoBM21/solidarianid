import Link from 'next/link';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

const links = [
  { href: '/communities', label: 'Comunidades' },
  { href: '/communities/create', label: 'Proponer comunidad' },
  { href: '/profile', label: 'Mi perfil' },
];

export default function AppNavbar() {
  return (
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm">
      <Container>
        <Link href="/" className="navbar-brand fw-semibold text-primary">
          SolidarianID
        </Link>

        <div className="navbar-nav d-flex flex-row flex-wrap gap-2 ms-auto">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link text-primary">
              {link.label}
            </Link>
          ))}
        </div>
      </Container>
    </Navbar>
  );
}
