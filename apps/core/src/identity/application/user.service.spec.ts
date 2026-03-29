import { left, PasswordHasherPort, right } from '@app/shared/domain';
import { UserAlreadyExistsError } from '@app/shared/domain/aggregates/abstract-user.aggregate';
import { InvalidUserEmailError } from '@app/shared/domain/value-objects/user-email.vo';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../domain/aggregates/user.aggregate';
import { CountryCheckerPort } from '../domain/ports/country-checker.port';
import {
  UserNotFoundError,
  UserRepository,
} from '../domain/repositories/user.repository';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;

  const mockQueryBus = {
    execute: jest.fn(),
  };

  const mockUserRepository = {
    findByEmail: jest.fn(),
    save: jest.fn(),
    list: jest.fn(),
  };

  const mockCountryChecker: CountryCheckerPort = {
    isValidCountryCode: () => true,
  };

  const mockPasswordHasher: PasswordHasherPort = {
    hashPassword: (password: string) => Promise.resolve(password),
    comparePassword: () => Promise.resolve(true),
  };

  const mockUsers: User[] = [];

  beforeEach(async () => {
    const user1 = User.createWithHashed(
      {
        name: 'User 1',
        email: 'email1@example.com',
        phone: '12345678',
        hashedPassword: 'password1',
        city: 'city 1',
        country: 'es',
      },
      mockCountryChecker,
    );
    if (user1.isRight()) {
      mockUsers.push(user1.value);
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
        {
          provide: CountryCheckerPort,
          useValue: mockCountryChecker,
        },
        {
          provide: PasswordHasherPort,
          useValue: mockPasswordHasher,
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

    // 2. S1-C1-S3-C2-S4-FIN
    it('should not create an invalid user', async () => {
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

    // 3. S1-C1-S3-C2-S5-S6-S7-FIN
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

  describe('listUsers', () => {
    it('should return users with their community names', async () => {
      const mockUsersList = [
        { id: mockUsers[0].id.toString(), name: mockUsers[0].name },
      ];
      mockUserRepository.list = jest
        .fn()
        .mockResolvedValue({ users: mockUsersList, totalPages: 1 });
      mockQueryBus.execute = jest.fn().mockResolvedValue({
        communityNamesPerUser: new Map<string, string[]>([
          [mockUsers[0].id.toString(), ['Community A', 'Community B']],
        ]),
      });

      const result = await service.listUsers();

      expect(result.users).toHaveLength(mockUsersList.length);
      expect(result.users[0].communities).toEqual([
        'Community A',
        'Community B',
      ]);
      expect(mockUserRepository.list).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userIds: mockUsersList.map((user) => user.id),
        }),
      );
    });
  });
});
