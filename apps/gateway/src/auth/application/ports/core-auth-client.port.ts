import { RegisterDto } from '../dtos/register.dto';

export abstract class CoreAuthClientPort {
  abstract validateCredentials(
    email: string,
    password: string,
  ): Promise<{ userId: string }>;

  abstract registerUser(data: RegisterDto): Promise<{ userId: string }>;

  abstract findOrCreateGoogleUser(
    email: string,
    name: string,
  ): Promise<{ userId: string }>;
}
