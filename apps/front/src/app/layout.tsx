import 'bootstrap/dist/css/bootstrap.min.css';
import type { Metadata } from 'next';
import AppApolloProvider from '../components/apollo/AppApolloProvider';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import SessionProvider from '../components/providers/SessionProvider';
import RegisterServiceWorker from '../components/pwa/RegisterServiceWorker';
import SyncPendingActions from '../components/pwa/SyncPendingActions';
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
        <meta name="theme-color" content="#0d6efd" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="icon"
          type="image/png"
          sizes="128x128"
          href="/icons/icon-128x128.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="192x192"
          href="/icons/icon-192x192.png"
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
            <SyncPendingActions />
            <Navbar />
            {children}
            <Footer />
          </AppApolloProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
