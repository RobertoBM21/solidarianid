import { Either } from '@app/shared/domain';
import {
  InvalidCredentialsError,
  UserAlreadyExistsError,
} from '@app/shared/domain/aggregates/abstract-user.aggregate';
import { UserCreationError } from '../../domain/aggregates/user.aggregate';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserListDto } from '../dtos/user-list.dto';

export abstract class UserPort {
  abstract createLocalUser(
    data: CreateUserDto,
  ): Promise<
    Either<UserCreationError | UserAlreadyExistsError, { id: string }>
  >;

  abstract validateCredentials(
    email: string,
    password: string,
  ): Promise<Either<InvalidCredentialsError, { userId: string }>>;

  abstract findOrCreateGoogleUser(
    email: string,
    name: string,
  ): Promise<Either<UserCreationError, { userId: string }>>;

  abstract listUsers(page?: number, search?: string): Promise<UserListDto>;
}
