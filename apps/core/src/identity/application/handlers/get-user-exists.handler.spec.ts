import { left, right, UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../domain/aggregates/user.aggregate';
import {
  UserNotFoundError,
  UserRepository,
} from '../../domain/repositories/user.repository';
import { GetUserExistsQuery } from '../queries/get-user-exists.query';
import { GetUserExistsHandler } from './get-user-exists.handler';

describe('GetUserExistsHandler', () => {
  let handler: GetUserExistsHandler;

  const mockUserRepository = {
    findById: jest.fn(),
  };

  const mockCountryChecker = {
    isValidCountryCode: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserExistsHandler,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    handler = module.get(GetUserExistsHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when user exists', async () => {
    const userId = UniqueEntityID.create();
    const user = User.createWithHashed(
      {
        name: 'Ana',
        email: 'ana@test.com',
        phone: '+34000000000',
        hashedPassword: 'hash',
        city: 'Madrid',
        country: 'es',
      },
      mockCountryChecker,
    ).value as User;

    mockUserRepository.findById.mockResolvedValue(right(user));

    const result = await handler.execute(new GetUserExistsQuery(userId));

    expect(result).toBe(true);
  });

  it('should return false when user does not exist', async () => {
    const userId = UniqueEntityID.create();

    mockUserRepository.findById.mockResolvedValue(
      left(new UserNotFoundError(userId.toString())),
    );

    const result = await handler.execute(new GetUserExistsQuery(userId));

    expect(result).toBe(false);
  });
});
