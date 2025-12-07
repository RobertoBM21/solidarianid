import { rabbitmqConfig } from '@app/shared/infrastructure';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AdminModule } from './admin.module';
import { setupMvcApp } from './presentation/setup-mvc';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AdminModule);
  app.connectMicroservice(rabbitmqConfig.asProvider());

  setupMvcApp(app, __dirname);

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
