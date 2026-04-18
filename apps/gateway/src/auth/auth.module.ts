import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { CoreAuthClientPort } from './application/ports/core-auth-client.port';
import { GatewayAuthPort } from './application/ports/gateway-auth.port';
import { GatewayAuthService } from './application/services/gateway-auth.service';
import authConfig from './infrastructure/config/auth.config';
import { GatewayAuthController } from './infrastructure/presentation/controllers/auth.controller';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { ClientsModule } from '@nestjs/microservices';
import { buildGrpcConfig } from '@app/shared/infrastructure/grpc/grpc-config.builder';
import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import { CoreAuthGrpcAdapter } from './infrastructure/adapters/core-auth-grpc.adapter';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(authConfig)],
      inject: [authConfig.KEY],
      useFactory: (config: { jwtSecret: string; jwtExpiration: string }) => ({
        secret: config.jwtSecret,
        signOptions: {
          expiresIn: config.jwtExpiration as StringValue,
        },
      }),
    }),
    ClientsModule.register([buildGrpcConfig(GrpcPackages.Auth)]),
  ],
  controllers: [GatewayAuthController],
  providers: [
    GatewayAuthService,
    CoreAuthGrpcAdapter,
    {
      provide: GatewayAuthPort,
      useExisting: GatewayAuthService,
    },
    {
      provide: CoreAuthClientPort,
      useExisting: CoreAuthGrpcAdapter,
    },
    LocalStrategy,
    GoogleStrategy,
    JwtStrategy,
  ],
})
export class AuthModule {}
