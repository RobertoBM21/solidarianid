import { RegisterDto } from '../dtos/register.dto';

export abstract class GatewayAuthPort {
  abstract validateUser(
    email: string,
    password: string,
  ): Promise<{ userId: string; email: string }>;

  abstract register(data: RegisterDto): Promise<{ access_token: string }>;

  abstract signIn(user: {
    email: string;
    name: string;
  }): Promise<{ access_token: string }>;

  abstract generateJwt(payload: { userId: string; email: string }): {
    access_token: string;
  };
}
