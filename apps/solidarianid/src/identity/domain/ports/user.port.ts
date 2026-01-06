import { Either } from '@app/shared/domain';
import {
  UserAlreadyExistsError,
  UserCreationError,
} from '../aggregates/user.aggregate';

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
    data: CreateUserData,
  ): Promise<
    Either<UserCreationError | UserAlreadyExistsError, { id: string }>
  >;
}
