import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { CoreAppModule } from '../../core/src/app.module';
import { GatewayAppModule } from '../src/app.module';
import { setupProxy } from '../src/proxy/proxy.middleware';
import { setupSwaggerAggregation } from '../src/swagger/swagger.setup';

describe('Gateway smoke (e2e)', () => {
  let coreApp: NestExpressApplication;
  let gatewayApp: NestExpressApplication;
  let previousCoreUrl: string | undefined;
  let previousJwtSecret: string | undefined;

  beforeAll(async () => {
    previousCoreUrl = process.env.CORE_URL;
    previousJwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-jwt-secret';

    coreApp = await createCoreApplication();
    process.env.CORE_URL = `http://127.0.0.1:${String(getListeningPort(coreApp))}`;

    gatewayApp = await createGatewayApplication();
  });

  afterAll(async () => {
    await gatewayApp.close();
    await coreApp.close();

    if (previousCoreUrl === undefined) {
      delete process.env.CORE_URL;
    } else {
      process.env.CORE_URL = previousCoreUrl;
    }

    if (previousJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = previousJwtSecret;
    }
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
    .addBearerAuth()
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
