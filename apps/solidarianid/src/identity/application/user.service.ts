import { Either, left, right } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import {
  User,
  UserAlreadyExistsError,
  UserCreationError,
} from '../domain/aggregates/user.aggregate';
import { CreateUserData, UserPort } from '../domain/ports/user.port';
import { UserRepository } from '../domain/repositories/user.repository';

@Injectable()
export class UserService implements UserPort {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(
    data: CreateUserData,
  ): Promise<
    Either<UserCreationError | UserAlreadyExistsError, { id: string }>
  > {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser.isRight()) {
      return left(new UserAlreadyExistsError());
    }

    const userOrError = User.create({
      ...data,
      passwordHash: data.password, // FIXME: hash me please!
    });

    if (userOrError.isLeft()) {
      return left(userOrError.value);
    }

    const user = userOrError.value;
    await this.userRepository.save(user);
    return right({ id: user.id.toString() });
  }
}
