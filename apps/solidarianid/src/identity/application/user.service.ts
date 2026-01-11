import { Either, left, PasswordHasherPort, right } from '@app/shared/domain';
import { UserAlreadyExistsError } from '@app/shared/domain/aggregates/abstract-user.aggregate';
import { Injectable } from '@nestjs/common';
import { User, UserCreationError } from '../domain/aggregates/user.aggregate';
import { CountryCheckerPort } from '../domain/ports/country-checker.port';
import { UserRepository } from '../domain/repositories/user.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserPort } from './ports/user.port';

@Injectable()
export class UserService implements UserPort {
  constructor(
    private readonly countryChecker: CountryCheckerPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(
    data: CreateUserDto,
  ): Promise<
    Either<UserCreationError | UserAlreadyExistsError, { id: string }>
  > {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser.isRight()) {
      return left(new UserAlreadyExistsError());
    }

    const userOrError = await User.create(
      data,
      this.countryChecker,
      this.passwordHasher,
    );

    if (userOrError.isLeft()) {
      return left(userOrError.value);
    }

    const user = userOrError.value;
    await this.userRepository.save(user);
    return right({ id: user.id.toString() });
  }
}
