import { Either } from '@app/shared/domain';
import {
  InvalidCredentialsError,
  UserAlreadyExistsError,
} from '@app/shared/domain/aggregates/abstract-user.aggregate';
import { AdminUserCreationError } from '../../domain/aggregates/admin-user.aggregate';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';

export abstract class AuthPort {
  abstract login(
    data: LoginDto,
  ): Promise<Either<InvalidCredentialsError, { id: string }>>;

  abstract register(
    data: RegisterDto,
  ): Promise<
    Either<AdminUserCreationError | UserAlreadyExistsError, { id: string }>
  >;
}
