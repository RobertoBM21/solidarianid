import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { GatewayAuthPort } from '../../application/ports/gateway-auth.port';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: GatewayAuthPort) {
    super({ usernameField: 'email' });
  }

  async validate(
    email: string,
    password: string,
  ): Promise<{ userId: string; email: string }> {
    return this.authService.validateUser(email, password);
  }
}
