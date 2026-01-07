import { Either } from '@app/shared/domain';
import {
  AdminUserCreationError,
  InvalidCredentialsError,
  UserAlreadyExistsError,
} from '../aggregates/admin-user.aggregate';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResult {
  id: string;
}

export abstract class AuthPort {
  abstract login(
    data: LoginData,
  ): Promise<Either<InvalidCredentialsError, AuthResult>>;

  abstract register(
    data: RegisterData,
  ): Promise<
    Either<AdminUserCreationError | UserAlreadyExistsError, AuthResult>
  >;
}
