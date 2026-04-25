type GrpcPackageName =
  | 'communities'
  | 'reports'
  | 'statistics'
  | 'auth'
  | 'identity';

enum GrpcMicroservice {
  CORE = 'CORE',
  IDENTITY = 'IDENTITY',
}

function createGrpcPackage(
  packageName: GrpcPackageName,
  microservice: GrpcMicroservice,
) {
  return {
    Package: packageName,
    ProtoPath: `grpc/protos/${packageName}.proto`,
    Client: `CLIENT_${packageName.toUpperCase()}`,
    ServiceName: `${packageName.charAt(0).toUpperCase() + packageName.slice(1)}Service`,
    Microservice: microservice,
  };
}

export const GrpcPackages = {
  Communities: createGrpcPackage('communities', GrpcMicroservice.CORE),
  Reports: createGrpcPackage('reports', GrpcMicroservice.CORE),
  Statistics: createGrpcPackage('statistics', GrpcMicroservice.CORE),

  Auth: createGrpcPackage('auth', GrpcMicroservice.IDENTITY),
  Identity: createGrpcPackage('identity', GrpcMicroservice.IDENTITY),
};

export type GrpcPackage = (typeof GrpcPackages)[keyof typeof GrpcPackages];
