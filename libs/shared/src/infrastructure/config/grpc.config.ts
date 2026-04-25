import { ClientProviderOptions, Transport } from '@nestjs/microservices';
import { getEnvVar } from '../../utils';
import { GrpcPackage } from '../grpc/grpc-packages';

export const buildGrpcMicroserviceConfig = (...grpcPackages: GrpcPackage[]) => {
  if (grpcPackages.length === 0) {
    throw new Error('At least one gRPC package must be provided');
  }

  const microservices = new Set(grpcPackages.map((pkg) => pkg.Microservice));
  if (microservices.size > 1) {
    throw new Error('All gRPC packages must belong to the same microservice');
  }

  return {
    transport: Transport.GRPC,
    options: {
      package: grpcPackages.map((pkg) => pkg.Package),
      protoPath: grpcPackages.map((pkg) => pkg.ProtoPath),
      url: getEnvVar(`${grpcPackages[0].Microservice}_GRPC_URL`),
    },
  };
};

export const buildGrpcClientConfig = (
  grpcPackage: GrpcPackage,
): ClientProviderOptions => ({
  name: grpcPackage.Client,
  transport: Transport.GRPC,
  options: {
    package: grpcPackage.Package,
    protoPath: grpcPackage.ProtoPath,
    url: getEnvVar(`${grpcPackage.Microservice}_GRPC_URL`),
    loader: {
      arrays: true,
      defaults: true,
    },
  },
});
