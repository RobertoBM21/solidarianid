'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

const authenticatedLinks = [
  { href: '/communities', label: 'Comunidades' },
  { href: '/communities/create', label: 'Proponer comunidad' },
  { href: '/profile', label: 'Mi perfil' },
];

const publicLinks = [{ href: '/communities', label: 'Comunidades' }];

export default function AppNavbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const links = isAuthenticated ? authenticatedLinks : publicLinks;

  return (
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm">
      <Container>
        <Link href="/" className="navbar-brand fw-semibold text-primary">
          SolidarianID
        </Link>

        <div className="navbar-nav d-flex flex-row flex-wrap gap-2 ms-auto align-items-center">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link text-primary"
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <>
              <span className="nav-link text-muted small">
                {session.user.email}
              </span>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  void signOut({ callbackUrl: '/login' });
                }}
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link text-primary">
                Iniciar sesión
              </Link>
              <Link href="/register" className="nav-link text-primary">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </Container>
    </Navbar>
  );
}
