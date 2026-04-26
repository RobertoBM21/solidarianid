import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { GatewayAppModule } from './app.module';
import { setupProxy } from './proxy/proxy.middleware';
import { setupSwaggerAggregation } from './swagger/swagger.setup';

async function bootstrap() {
  const app = await NestFactory.create(GatewayAppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? '*',
  });

  setupSwaggerAggregation(app);
  setupProxy(app);

  await app.listen(process.env.PORT ?? 3010);
}

void bootstrap();
