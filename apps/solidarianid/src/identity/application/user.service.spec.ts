import { left, right } from '@app/shared/domain';
import { InvalidUserEmailError } from '@app/shared/domain/value-objects/user-email.vo';
import { InvalidUserPasswordError } from '@app/shared/domain/value-objects/user-password.vo';
import { Test, TestingModule } from '@nestjs/testing';
import {
  User,
  UserAlreadyExistsError,
} from '../domain/aggregates/user.aggregate';
import { CountryCheckerPort } from '../domain/ports/country-checker.port';
import {
  UserNotFoundError,
  UserRepository,
} from '../domain/repositories/user.repository';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    save: jest.fn(),
  };

  const mockCountryChecker: CountryCheckerPort = {
    isValidCountryCode: () => true,
  };

  const mockUsers: User[] = [];
  const user1 = User.create(
    {
      name: 'User 1',
      email: 'email1@example.com',
      phone: '12345678',
      passwordHash: 'password1',
      city: 'city 1',
      country: 'es',
    },
    mockCountryChecker,
  );
  if (user1.isRight()) {
    mockUsers.push(user1.value);
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CountryCheckerPort,
          useValue: mockCountryChecker,
        },
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    // Basic path tests

    // 1. S1-C1-S2-FIN
    it('should not create a user if email already exists', async () => {
      userRepository.findByEmail = jest
        .fn()
        .mockResolvedValue(right(mockUsers[0]));

      const result = await service.createUser({
        name: 'User 1',
        email: 'email1@example.com',
        phone: '11122233',
        password: 'password1',
        city: 'city 1',
        country: 'es',
      });
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(UserAlreadyExistsError);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    // 2. S1-C1-C2-S3-FIN
    it('should not create a user with an empty password', async () => {
      mockUserRepository.findByEmail = jest
        .fn()
        .mockResolvedValue(left(new UserNotFoundError('')));

      const result = await service.createUser({
        name: 'User 2',
        email: 'email2@example.com',
        phone: '44455566',
        password: '',
        city: 'city 2',
        country: 'es',
      });
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidUserPasswordError);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    // 3. S1-C1-C2-S4-S5-S6-C3-S7-FIN
    it('should not create a user with invalid email', async () => {
      mockUserRepository.findByEmail = jest
        .fn()
        .mockResolvedValue(left(new UserNotFoundError('')));

      const result = await service.createUser({
        name: 'User 3',
        email: 'invalid-email',
        phone: '44455566',
        password: 'password3',
        city: 'city 3',
        country: 'es',
      });
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidUserEmailError);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    // 4. S1-C1-C2-S4-S5-S6-C3-S8-S9-S10-FIN
    it('should create a new user', async () => {
      userRepository.findByEmail = jest
        .fn()
        .mockResolvedValue(left(new UserNotFoundError('')));
      userRepository.save = jest.fn().mockResolvedValue(undefined);

      const result = await service.createUser({
        name: 'User 4',
        email: 'email4@example.com',
        phone: '98765432',
        password: 'password4',
        city: 'city 4',
        country: 'es',
      });
      expect(result.isRight()).toBe(true);
      if (result.isLeft()) return;
      const user = result.value;

      expect(user.id).toBeDefined();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'email4@example.com',
      );
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(User));
    });
  });
});
