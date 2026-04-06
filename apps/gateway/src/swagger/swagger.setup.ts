import { INestApplication } from '@nestjs/common';
import { Express } from 'express';
import * as swaggerUi from 'swagger-ui-express';

interface SwaggerServiceEntry {
  name: string;
  url: string;
}

export function setupSwaggerAggregation(app: INestApplication) {
  const coreUrl = process.env.CORE_URL ?? 'http://localhost:3000';

  const services: SwaggerServiceEntry[] = [
    { name: 'Core', url: '/api/core-json' },
    // Future: { name: 'Donations', url: '/api/donations-json' },
  ];

  const expressApp = app.getHttpAdapter().getInstance() as Express;

  // Proxy each service's OpenAPI JSON
  expressApp.get('/api/core-json', async (_req, res) => {
    try {
      const response = await fetch(`${coreUrl}/api-json`);
      const json = (await response.json()) as Record<string, unknown>;
      res.json(json);
    } catch {
      res.status(502).json({ error: 'Core service unavailable' });
    }
  });

  // Serve aggregated Swagger UI at /api
  const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
      urls: services,
    },
  };

  expressApp.use(
    '/api',
    swaggerUi.serve,
    swaggerUi.setup(null, swaggerOptions),
  );
}
