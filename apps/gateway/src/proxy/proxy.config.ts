export interface ServiceRoute {
  path: string;
  target: string;
  ws?: boolean;
  exclude?: string[];
}

export function proxyConfig(): ServiceRoute[] {
  return [
    // Add specific service routes here before the catch-all.

    // Example for future donations service:
    // { path: '/donations', target: process.env.DONATIONS_URL ?? 'http://localhost:3020' },

    // GraphQL — served by core, with WebSocket support for subscriptions.
    {
      path: '/graphql',
      target: process.env.CORE_URL ?? 'http://localhost:3000',
      ws: true,
    },

    // Catch-all: everything else goes to core (excludes /auth handled by gateway)
    {
      path: '/',
      target: process.env.CORE_URL ?? 'http://localhost:3000',
      exclude: ['/auth'],
    },
  ];
}
