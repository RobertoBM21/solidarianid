import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Express } from 'express';
import * as swaggerUi from 'swagger-ui-express';

interface SwaggerServiceEntry {
  name: string;
  url: string;
}

export function setupSwaggerAggregation(app: INestApplication) {
  const coreUrl = process.env.CORE_URL ?? 'http://localhost:3000';

  // Generate gateway's own OpenAPI doc (auth endpoints)
  const gatewayConfig = new DocumentBuilder()
    .setTitle('Gateway – Auth')
    .setDescription('Authentication endpoints (login, register, Google OAuth)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const gatewayDocument = SwaggerModule.createDocument(app, gatewayConfig);

  const services: SwaggerServiceEntry[] = [
    { name: 'Gateway – Auth', url: '/api/gateway-json' },
    { name: 'Core', url: '/api/core-json' },
    // Future: { name: 'Donations', url: '/api/donations-json' },
  ];

  const expressApp = app.getHttpAdapter().getInstance() as Express;

  // Serve gateway's own OpenAPI JSON
  expressApp.get('/api/gateway-json', (_req, res) => {
    res.json(gatewayDocument);
  });

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
