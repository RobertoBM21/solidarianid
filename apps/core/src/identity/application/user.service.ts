import {
  Either,
  left,
  PasswordHasherPort,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import {
  InvalidCredentialsError,
  UserAlreadyExistsError,
} from '@app/shared/domain/aggregates/abstract-user.aggregate';
import { Injectable } from '@nestjs/common';
import { User, UserCreationError } from '../domain/aggregates/user.aggregate';
import { CountryCheckerPort } from '../domain/ports/country-checker.port';
import {
  UserNotFoundError,
  UserRepository,
} from '../domain/repositories/user.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { ProfileOutDto } from './dtos/profile-out.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UserPort } from './ports/user.port';
import { UserListDto } from './dtos/user-list.dto';
import { GetMembershipsPort } from './ports/get-memberships.port';

@Injectable()
export class UserService implements UserPort {
  constructor(
    private readonly countryChecker: CountryCheckerPort,
    private readonly getMembershipsService: GetMembershipsPort,
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

  async listUsers(page?: number, search?: string): Promise<UserListDto> {
    const { users, totalPages } = await this.userRepository.list(page, search);
    const userIds = users.map((user) => user.id);
    const memberships =
      await this.getMembershipsService.getMemberships(userIds);
    const mappedUsers = users.map((user) => ({
      ...user,
      communities: memberships.get(user.id) ?? [],
    }));
    return {
      users: mappedUsers,
      totalPages,
    };
  }

  async getProfile(
    userId: string,
  ): Promise<Either<UserNotFoundError, ProfileOutDto>> {
    const userOrError = await this.userRepository.findById(
      UniqueEntityID.create(userId),
    );
    if (userOrError.isLeft()) {
      return left(userOrError.value);
    }
    const user = userOrError.value;
    return right(this.toProfileDto(user));
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileDto,
  ): Promise<Either<UserNotFoundError | UserCreationError, ProfileOutDto>> {
    const userOrError = await this.userRepository.findById(
      UniqueEntityID.create(userId),
    );
    if (userOrError.isLeft()) {
      return left(userOrError.value);
    }
    const user = userOrError.value;

    const updateResult = user.update(data, this.countryChecker);
    if (updateResult.isLeft()) {
      return left(updateResult.value);
    }

    await this.userRepository.save(user);
    return right(this.toProfileDto(user));
  }

  private toProfileDto(user: User): ProfileOutDto {
    const dto = new ProfileOutDto();
    dto.id = user.id.toString();
    dto.name = user.name;
    dto.email = user.email;
    dto.phone = user.phone;
    dto.city = user.city;
    dto.country = user.country;
    return dto;
  }
}
