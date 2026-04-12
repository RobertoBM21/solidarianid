import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { RegisterDto } from '../../application/dtos/register.dto';
import { CoreAuthClientPort } from '../../application/ports/core-auth-client.port';
import authConfig from '../config/auth.config';

@Injectable()
export class CoreAuthHttpAdapter extends CoreAuthClientPort {
  private readonly coreUrl: string;

  constructor(
    @Inject(authConfig.KEY)
    config: ConfigType<typeof authConfig>,
  ) {
    super();
    this.coreUrl = config.coreUrl;
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<{ userId: string }> {
    const response = await fetch(`${this.coreUrl}/auth/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return (await response.json()) as { userId: string };
  }

  async registerUser(data: RegisterDto): Promise<{ userId: string }> {
    const response = await fetch(`${this.coreUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new BadRequestException(error.message ?? 'Registration failed');
    }

    return (await response.json()) as { userId: string };
  }

  async findOrCreateGoogleUser(
    email: string,
    name: string,
  ): Promise<{ userId: string }> {
    const response = await fetch(`${this.coreUrl}/auth/google-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new BadRequestException(
        error.message ?? 'Google authentication failed',
      );
    }

    return (await response.json()) as { userId: string };
  }
}
