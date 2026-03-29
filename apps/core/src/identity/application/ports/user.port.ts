import { Either } from '@app/shared/domain';
import { UserAlreadyExistsError } from '@app/shared/domain/aggregates/abstract-user.aggregate';
import { GetUsersQueryResult } from '@app/shared/domain/queries/get-users.query';
import { UserCreationError } from '../../domain/aggregates/user.aggregate';
import { CreateUserDto } from '../dtos/create-user.dto';

export interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  country: string;
}

export abstract class UserPort {
  abstract createUser(
    data: CreateUserDto,
  ): Promise<
    Either<UserCreationError | UserAlreadyExistsError, { id: string }>
  >;

  abstract listUsers(
    page?: number,
    search?: string,
  ): Promise<GetUsersQueryResult>;
}
