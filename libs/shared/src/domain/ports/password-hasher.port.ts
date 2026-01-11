export abstract class PasswordHasherPort {
  abstract hashPassword(password: string): Promise<string>;
  abstract comparePassword(plain: string, hashed: string): Promise<boolean>;
}
