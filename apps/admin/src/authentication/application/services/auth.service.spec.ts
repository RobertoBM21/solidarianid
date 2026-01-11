import { left, PasswordHasherPort, right } from '@app/shared/domain';
import {
  InvalidCredentialsError,
  UserAlreadyExistsError,
} from '@app/shared/domain/aggregates/abstract-user.aggregate';
import { InvalidUserEmailError } from '@app/shared/domain/value-objects/user-email.vo';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AdminUser } from '../../domain/aggregates/admin-user.aggregate';
import {
  AdminUserNotFoundError,
  AdminUserRepository,
} from '../../domain/repositories/admin-user.repository';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockAdminUserRepository = {
    findByEmail: jest.fn(),
    save: jest.fn(),
  };

  let validAdminUser: AdminUser;

  const mockPasswordHasher: PasswordHasherPort = {
    hashPassword: (pass) => Promise.resolve(bcrypt.hashSync(pass, 10)),
    comparePassword: (plain, hash) => bcrypt.compare(plain, hash),
  };

  beforeEach(async () => {
    const validAdminUserOrError = AdminUser.createWithHashed({
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '12345678',
      hashedPassword: bcrypt.hashSync('password123', 10),
    });
    validAdminUser = validAdminUserOrError.value as AdminUser;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AdminUserRepository,
          useValue: mockAdminUserRepository,
        },
        {
          provide: PasswordHasherPort,
          useValue: mockPasswordHasher,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return user id when credentials are valid', async () => {
      mockAdminUserRepository.findByEmail.mockResolvedValue(
        right(validAdminUser),
      );

      const result = await service.login({
        email: 'admin@example.com',
        password: 'password123',
      });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toEqual({ id: validAdminUser.id.toString() });
      }
    });

    it('should return InvalidCredentialsError when user does not exist', async () => {
      mockAdminUserRepository.findByEmail.mockResolvedValue(
        left(new AdminUserNotFoundError('admin@example.com')),
      );

      const result = await service.login({
        email: 'admin@example.com',
        password: 'password123',
      });

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidCredentialsError);
    });

    it('should return InvalidCredentialsError when password does not match', async () => {
      mockAdminUserRepository.findByEmail.mockResolvedValue(
        right(validAdminUser),
      );

      const result = await service.login({
        email: 'admin@example.com',
        password: 'wrongpassword',
      });

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidCredentialsError);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockAdminUserRepository.findByEmail.mockResolvedValue(
        left(new AdminUserNotFoundError('new@example.com')),
      );

      const result = await service.register({
        name: 'New Admin',
        email: 'new@example.com',
        password: 'password123',
        phone: '12345678',
      });

      expect(result.isRight()).toBe(true);
      expect(mockAdminUserRepository.save).toHaveBeenCalled();
    });

    it('should return UserAlreadyExistsError if email is already in use', async () => {
      mockAdminUserRepository.findByEmail.mockResolvedValue(
        right(validAdminUser),
      );

      const result = await service.register({
        name: 'New Admin',
        email: 'admin@example.com',
        password: 'password123',
        phone: '12345678',
      });

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(UserAlreadyExistsError);
      expect(mockAdminUserRepository.save).not.toHaveBeenCalled();
    });

    it('should return domain error if data is invalid (e.g. invalid email)', async () => {
      mockAdminUserRepository.findByEmail.mockResolvedValue(
        left(new AdminUserNotFoundError('invalid-email')),
      );

      const result = await service.register({
        name: 'New Admin',
        email: 'invalid-email',
        password: 'password123',
        phone: '12345678',
      });

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidUserEmailError);
      expect(mockAdminUserRepository.save).not.toHaveBeenCalled();
    });
  });
});
