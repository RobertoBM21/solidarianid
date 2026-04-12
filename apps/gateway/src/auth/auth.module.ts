import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { CoreAuthClientPort } from './application/ports/core-auth-client.port';
import { GatewayAuthPort } from './application/ports/gateway-auth.port';
import { GatewayAuthService } from './application/services/gateway-auth.service';
import { CoreAuthHttpAdapter } from './infrastructure/adapters/core-auth-http.adapter';
import authConfig from './infrastructure/config/auth.config';
import { GatewayAuthController } from './infrastructure/presentation/controllers/auth.controller';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';

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
  ],
  controllers: [GatewayAuthController],
  providers: [
    GatewayAuthService,
    CoreAuthHttpAdapter,
    {
      provide: GatewayAuthPort,
      useExisting: GatewayAuthService,
    },
    {
      provide: CoreAuthClientPort,
      useExisting: CoreAuthHttpAdapter,
    },
    LocalStrategy,
    GoogleStrategy,
    JwtStrategy,
  ],
})
export class AuthModule {}
