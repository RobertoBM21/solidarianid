import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupProxy } from './proxy/proxy.middleware';
import { setupSwaggerAggregation } from './swagger/swagger.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //! Check which value to use for CORS_ORIGIN
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
  });

  setupSwaggerAggregation(app);
  setupProxy(app);

  await app.listen(process.env.PORT ?? 3010);
}

void bootstrap();
