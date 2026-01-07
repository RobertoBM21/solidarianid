import { Either, left, right } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  AdminUser,
  AdminUserCreationError,
  InvalidCredentialsError,
  UserAlreadyExistsError,
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
  constructor(private readonly adminUserRepository: AdminUserRepository) {}

  async login(
    data: LoginData,
  ): Promise<Either<InvalidCredentialsError, AuthResult>> {
    const userOrError = await this.adminUserRepository.findByEmail(data.email);

    if (userOrError.isLeft()) {
      return left(new InvalidCredentialsError());
    }

    const user = userOrError.value;

    const isPasswordValid = await bcrypt.compare(
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

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const adminUserOrError = AdminUser.create({
      email: data.email,
      name: data.name,
      passwordHash: hashedPassword,
      phone: data.phone,
    });

    if (adminUserOrError.isLeft()) {
      return left(adminUserOrError.value);
    }

    const adminUser = adminUserOrError.value;
    await this.adminUserRepository.save(adminUser);

    return right({ id: adminUser.id.toString() });
  }
}
