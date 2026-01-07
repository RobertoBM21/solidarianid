import { DomainError, Either, Repository } from '@app/shared/domain';
import { AdminUser } from '../aggregates/admin-user.aggregate';

export class AdminUserNotFoundError implements DomainError {
  readonly message: string;
  constructor(public readonly idOrEmail: string) {
    this.message = `AdminUser with Email ${idOrEmail} not found.`;
  }
}

export abstract class AdminUserRepository extends Repository<
  AdminUser,
  AdminUserNotFoundError
> {
  abstract findByEmail(
    email: string,
  ): Promise<Either<AdminUserNotFoundError, AdminUser>>;
}
