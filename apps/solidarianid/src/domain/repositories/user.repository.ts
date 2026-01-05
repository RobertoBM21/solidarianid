import { DomainError, Either, Repository } from '@app/shared/domain';
import { User } from '../aggregates/user.aggregate';

export class UserNotFoundError implements DomainError {
  readonly message: string;
  constructor(public readonly idOrEmail: string) {
    this.message = `User with ID or Email ${idOrEmail} not found.`;
  }
}

export abstract class UserRepository extends Repository<
  User,
  UserNotFoundError
> {
  abstract findByEmail(email: string): Promise<Either<UserNotFoundError, User>>;
}
