import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CoreAuthClientPort } from '../ports/core-auth-client.port';
import { GatewayAuthPort } from '../ports/gateway-auth.port';

@Injectable()
export class GatewayAuthService implements GatewayAuthPort {
  constructor(
    private readonly jwtService: JwtService,
    private readonly coreAuthClient: CoreAuthClientPort,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<{ userId: string; email: string }> {
    const { userId } = await this.coreAuthClient.validateCredentials(
      email,
      password,
    );
    return { userId, email };
  }

  async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    city?: string;
    country?: string;
  }): Promise<{ access_token: string }> {
    const { userId } = await this.coreAuthClient.registerUser(data);
    return this.generateJwt({ userId, email: data.email });
  }

  async signIn(user: {
    email: string;
    name: string;
  }): Promise<{ access_token: string }> {
    const { userId } = await this.coreAuthClient.findOrCreateGoogleUser(
      user.email,
      user.name,
    );
    return this.generateJwt({ userId, email: user.email });
  }

  generateJwt(payload: { userId: string; email: string }): {
    access_token: string;
  } {
    const token = this.jwtService.sign({
      sub: payload.userId,
      email: payload.email,
    });
    return { access_token: token };
  }
}
