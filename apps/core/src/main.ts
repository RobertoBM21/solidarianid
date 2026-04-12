import { natsConfig } from '@app/shared/infrastructure';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { CoreAppModule } from './app.module';
import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';

async function bootstrap() {
  const app = await NestFactory.create(CoreAppModule);
  app.connectMicroservice(natsConfig.asProvider());
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: [GrpcPackages.Statistics.Package, GrpcPackages.Reports.Package],
      protoPath: [
        GrpcPackages.Statistics.ProtoPath,
        GrpcPackages.Reports.ProtoPath,
      ],
      url: process.env.CORE_GRPC_URL ?? '127.0.0.1:5002',
    },
  });

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
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
