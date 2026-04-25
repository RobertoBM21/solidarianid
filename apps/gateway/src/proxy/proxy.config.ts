export interface ServiceRoute {
  path: string;
  target: string;
  ws?: boolean;
  exclude?: string[];
}

export function proxyConfig(): ServiceRoute[] {
  return [
    // GraphQL — served by core, with WebSocket support for subscriptions.
    {
      path: '/graphql',
      target: process.env.CORE_URL ?? 'http://localhost:3000',
      ws: true,
    },

    // Identity
    {
      path: '/profile',
      target: process.env.IDENTITY_URL ?? 'http://localhost:3002',
    },

    // Catch-all: everything else goes to core (excludes /auth handled by gateway)
    {
      path: '/',
      target: process.env.CORE_URL ?? 'http://localhost:3000',
      exclude: ['/auth'],
    },
  ];
}
