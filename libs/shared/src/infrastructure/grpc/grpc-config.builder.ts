import { ClientProviderOptions, Transport } from '@nestjs/microservices';
import { GrpcPackages } from './grpc-packages';

type GrpcPackageConfig = (typeof GrpcPackages)[keyof typeof GrpcPackages];

export function buildGrpcConfig(grpcPackage: GrpcPackageConfig) {
  const options: ClientProviderOptions = {
    name: grpcPackage.Client,
    transport: Transport.GRPC,
    options: {
      package: grpcPackage.Package,
      protoPath: grpcPackage.ProtoPath,
      url: process.env['CORE_GRPC_URL'] ?? '127.0.0.1:5002',
      loader: {
        arrays: true,
        defaults: true,
      },
    },
  };
  return options;
}
