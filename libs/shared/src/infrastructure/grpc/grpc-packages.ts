type GrpcPackageName = 'reports' | 'statistics' | 'auth';

function createGrpcPackage(packageName: GrpcPackageName) {
  return {
    Package: packageName,
    ProtoPath: `grpc/protos/${packageName}.proto`,
    Client: `CLIENT_${packageName.toUpperCase()}`,
    ServiceName: `${packageName.charAt(0).toUpperCase() + packageName.slice(1)}Service`,
  };
}

export const GrpcPackages = {
  Reports: createGrpcPackage('reports'),
  Statistics: createGrpcPackage('statistics'),
  Auth: createGrpcPackage('auth'),
};
