import { natsConfig } from '@app/shared/infrastructure';
import { buildGrpcMicroserviceConfig } from '@app/shared/infrastructure/config/grpc.config';
import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IdentityAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(IdentityAppModule);
  app.connectMicroservice(natsConfig.asProvider());
  app.connectMicroservice(
    buildGrpcMicroserviceConfig(GrpcPackages.Auth, GrpcPackages.Identity),
  );

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

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3002);
}

void bootstrap();
