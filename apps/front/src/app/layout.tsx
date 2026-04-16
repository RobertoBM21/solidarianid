import 'bootstrap/dist/css/bootstrap.min.css';
import type { Metadata } from 'next';
import AppApolloProvider from '../components/apollo/AppApolloProvider';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import SessionProvider from '../components/providers/SessionProvider';
import RegisterServiceWorker from '../components/pwa/RegisterServiceWorker';
import './global.css';

export const metadata: Metadata = {
  title: 'SolidarianID',
  description: 'Frontend general de SolidarianID',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="icon"
          type="image/png"
          sizes="128x128"
          href="/icons/icon-128x128.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="128x128"
          href="/icons/icon-128x128.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icons/icon-512x512.png"
        />
      </head>
      <body className="d-flex flex-column min-vh-100">
        <SessionProvider>
          <AppApolloProvider>
            <RegisterServiceWorker />
            <Navbar />
            {children}
            <Footer />
          </AppApolloProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
