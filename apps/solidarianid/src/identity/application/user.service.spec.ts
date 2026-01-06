import { left, right } from '@app/shared/domain';
import { InvalidUserEmailError } from '@app/shared/domain/value-objects/user-email.vo';
import { Test, TestingModule } from '@nestjs/testing';
import {
  User,
  UserAlreadyExistsError,
} from '../domain/aggregates/user.aggregate';
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

  const mockUsers: User[] = [];
  const user1 = User.create({
    name: 'User 1',
    email: 'email1@example.com',
    phone: '12345678',
    passwordHash: 'hashedpassword1',
    city: 'city 1',
    country: 'country 1',
  });
  if (user1.isRight()) {
    mockUsers.push(user1.value);
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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
    it('should create a new user', async () => {
      userRepository.findByEmail = jest
        .fn()
        .mockResolvedValue(left(new UserNotFoundError('')));
      userRepository.save = jest.fn().mockResolvedValue(undefined);

      const result = await service.createUser({
        name: 'User 2',
        email: 'email2@example.com',
        phone: '98765432',
        password: 'hashedpassword2',
        city: 'city 2',
        country: 'fr',
      });
      expect(result.isRight()).toBe(true);
      if (result.isLeft()) return;
      const user = result.value;

      expect(user.id).toBeDefined();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'email2@example.com',
      );
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(User));
    });

    it('should not create a user if email already exists', async () => {
      userRepository.findByEmail = jest
        .fn()
        .mockResolvedValue(right(mockUsers[0]));

      const result = await service.createUser({
        name: 'User 3',
        email: 'email1@example.com',
        phone: '11122233',
        password: 'hashedpassword3',
        city: 'city 3',
        country: 'country 3',
      });
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(UserAlreadyExistsError);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should not create a user with invalid email', async () => {
      mockUserRepository.findByEmail = jest
        .fn()
        .mockResolvedValue(left(new UserNotFoundError('')));

      const result = await service.createUser({
        name: 'User 4',
        email: 'invalid-email',
        phone: '44455566',
        password: 'hashedpassword4',
        city: 'city 4',
        country: 'country 4',
      });
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidUserEmailError);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });
});
