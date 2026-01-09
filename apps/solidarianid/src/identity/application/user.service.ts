import { Either, left, right } from '@app/shared/domain';
import { InvalidUserPasswordError } from '@app/shared/domain/value-objects/user-password.vo';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  User,
  UserAlreadyExistsError,
  UserCreationError,
} from '../domain/aggregates/user.aggregate';
import { CountryCheckerPort } from '../domain/ports/country-checker.port';
import { CreateUserData, UserPort } from '../domain/ports/user.port';
import { UserRepository } from '../domain/repositories/user.repository';

@Injectable()
export class UserService implements UserPort {
  constructor(
    private readonly countryChecker: CountryCheckerPort,
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(
    data: CreateUserData,
  ): Promise<
    Either<UserCreationError | UserAlreadyExistsError, { id: string }>
  > {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser.isRight()) {
      return left(new UserAlreadyExistsError());
    }

    if (!data.password) {
      return left(new InvalidUserPasswordError());
    }

    const saltRounds = 10;
    const hash = await bcrypt.hash(data.password, saltRounds);

    const userOrError = User.create(
      {
        ...data,
        passwordHash: hash,
      },
      this.countryChecker,
    );

    if (userOrError.isLeft()) {
      return left(userOrError.value);
    }

    const user = userOrError.value;
    await this.userRepository.save(user);
    return right({ id: user.id.toString() });
  }
}
