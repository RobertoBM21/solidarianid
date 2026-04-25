import { DomainError, Either, Repository } from '@app/shared/domain';
import { User } from '../aggregates/user.aggregate';

export class UserNotFoundError implements DomainError {
  readonly message: string;
  constructor(public readonly idOrEmail: string) {
    this.message = `User with ID or Email ${idOrEmail} not found.`;
  }
}

export interface UserListItem {
  id: string;
  name: string;
}

export interface UsersPage {
  users: UserListItem[];
  totalPages: number;
}

export abstract class UserRepository extends Repository<
  User,
  UserNotFoundError
> {
  abstract findByEmail(email: string): Promise<Either<UserNotFoundError, User>>;
  abstract list(page?: number, search?: string): Promise<UsersPage>;
}
