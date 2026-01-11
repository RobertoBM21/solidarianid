import { Either, left, PasswordHasherPort, right } from '@app/shared/domain';
import {
  InvalidCredentialsError,
  UserAlreadyExistsError,
} from '@app/shared/domain/aggregates/abstract-user.aggregate';
import { Injectable } from '@nestjs/common';
import {
  AdminUser,
  AdminUserCreationError,
} from '../../domain/aggregates/admin-user.aggregate';
import {
  AuthPort,
  AuthResult,
  LoginData,
  RegisterData,
} from '../../domain/ports/auth.port';
import { AdminUserRepository } from '../../domain/repositories/admin-user.repository';

@Injectable()
export class AuthService implements AuthPort {
  constructor(
    private readonly adminUserRepository: AdminUserRepository,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async login(
    data: LoginData,
  ): Promise<Either<InvalidCredentialsError, AuthResult>> {
    const userOrError = await this.adminUserRepository.findByEmail(data.email);

    if (userOrError.isLeft()) {
      return left(new InvalidCredentialsError());
    }

    const user = userOrError.value;

    const isPasswordValid = await this.passwordHasher.comparePassword(
      data.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      return left(new InvalidCredentialsError());
    }

    return right({ id: user.id.toString() });
  }

  async register(
    data: RegisterData,
  ): Promise<
    Either<AdminUserCreationError | UserAlreadyExistsError, AuthResult>
  > {
    const userOrError = await this.adminUserRepository.findByEmail(data.email);

    if (userOrError.isRight()) {
      return left(new UserAlreadyExistsError());
    }

    const adminUserOrError = await AdminUser.create(
      {
        email: data.email,
        name: data.name,
        password: data.password,
        phone: data.phone,
      },
      this.passwordHasher,
    );

    if (adminUserOrError.isLeft()) {
      return left(adminUserOrError.value);
    }

    const adminUser = adminUserOrError.value;
    await this.adminUserRepository.save(adminUser);

    return right({ id: adminUser.id.toString() });
  }
}
