import { Either, left, PasswordHasherPort, right } from '@app/shared/domain';
import {
  InvalidCredentialsError,
  UserAlreadyExistsError,
} from '@app/shared/domain/aggregates/abstract-user.aggregate';
import { GetUsersQueryResult } from '@app/shared/domain/queries/get-users.query';
import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetMembershipsQuery } from '../../communities/application/queries/get-memberships.query';
import { User, UserCreationError } from '../domain/aggregates/user.aggregate';
import { CountryCheckerPort } from '../domain/ports/country-checker.port';
import { UserRepository } from '../domain/repositories/user.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserPort } from './ports/user.port';

@Injectable()
export class UserService implements UserPort {
  constructor(
    private readonly countryChecker: CountryCheckerPort,
    private readonly queryBus: QueryBus,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly userRepository: UserRepository,
  ) {}

  async createLocalUser(
    data: CreateUserDto,
  ): Promise<
    Either<UserCreationError | UserAlreadyExistsError, { id: string }>
  > {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser.isRight()) {
      return left(new UserAlreadyExistsError());
    }

    const userOrError = await User.create(
      {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        city: data.city,
        country: data.country,
      },
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

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<Either<InvalidCredentialsError, { userId: string }>> {
    const userOrError = await this.userRepository.findByEmail(email);
    if (userOrError.isLeft()) {
      return left(new InvalidCredentialsError());
    }

    const user = userOrError.value;
    if (!user.passwordHash) {
      return left(new InvalidCredentialsError());
    }

    const isValid = await this.passwordHasher.comparePassword(
      password,
      user.passwordHash,
    );
    if (!isValid) {
      return left(new InvalidCredentialsError());
    }

    return right({ userId: user.id.toString() });
  }

  async findOrCreateGoogleUser(
    email: string,
    name: string,
  ): Promise<Either<UserCreationError, { userId: string }>> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser.isRight()) {
      return right({ userId: existingUser.value.id.toString() });
    }

    const userOrError = User.createSocialUser({ name, email });
    if (userOrError.isLeft()) {
      return left(userOrError.value);
    }

    const user = userOrError.value;
    await this.userRepository.save(user);
    return right({ userId: user.id.toString() });
  }

  async listUsers(
    page?: number,
    search?: string,
  ): Promise<GetUsersQueryResult> {
    const { users, totalPages } = await this.userRepository.list(page, search);
    const memberships = await this.queryBus.execute(
      new GetMembershipsQuery(users.map((user) => user.id)),
    );
    const mappedUsers = users.map((user) => ({
      ...user,
      communities: memberships.communityNamesPerUser.get(user.id) ?? [],
    }));
    return {
      users: mappedUsers,
      totalPages,
    };
  }
}
