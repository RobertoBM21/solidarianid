import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule as CoreAppModule } from '../../core/src/app.module';
import { AppModule as GatewayAppModule } from '../src/app.module';
import { setupProxy } from '../src/proxy/proxy.middleware';
import { setupSwaggerAggregation } from '../src/swagger/swagger.setup';

describe('Gateway smoke (e2e)', () => {
  let coreApp: NestExpressApplication;
  let gatewayApp: NestExpressApplication;
  let previousCoreUrl: string | undefined;

  beforeAll(async () => {
    previousCoreUrl = process.env.CORE_URL;

    coreApp = await createCoreApplication();
    process.env.CORE_URL = `http://127.0.0.1:${String(getListeningPort(coreApp))}`;

    gatewayApp = await createGatewayApplication();
  });

  afterAll(async () => {
    await gatewayApp.close();
    await coreApp.close();

    if (previousCoreUrl === undefined) {
      delete process.env.CORE_URL;
      return;
    }

    process.env.CORE_URL = previousCoreUrl;
  });

  it('proxies a core API route through the gateway', async () => {
    const response = await request(gatewayApp.getHttpServer())
      .get('/communities')
      .expect(HttpStatus.OK);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('serves the aggregated OpenAPI JSON for core', async () => {
    const response = await request(gatewayApp.getHttpServer())
      .get('/api/core-json')
      .expect(HttpStatus.OK);

    expect(response.body.openapi).toBeDefined();
    expect(response.body.info?.title).toBe('SolidarianID API');
  });
});

async function createCoreApplication(): Promise<NestExpressApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [CoreAppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<NestExpressApplication>();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('SolidarianID API')
    .setDescription('The SolidarianID official API')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description:
          'Enter your UUIDv4 token directly (e.g., 550e8400-e29b-41d4-a716-446655440000)',
      },
      'userId',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(0);

  return app;
}

async function createGatewayApplication(): Promise<NestExpressApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [GatewayAppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<NestExpressApplication>();

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
  });

  setupSwaggerAggregation(app);
  setupProxy(app);

  await app.init();

  return app;
}

function getListeningPort(app: NestExpressApplication): number {
  const address = app.getHttpServer().address();

  if (!address || typeof address === 'string') {
    throw new Error('Core test server is not listening on a TCP port');
  }

  return address.port;
}
