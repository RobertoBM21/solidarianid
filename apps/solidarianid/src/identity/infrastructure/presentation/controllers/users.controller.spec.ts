import { left, right } from '@app/shared/domain';
import { Test } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { UserPort } from '../../../application/ports/user.port';
import { UsersController } from './users.controller';

describe('usersController', () => {
  let controller: UsersController;

  const mockUserPort = {
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UserPort,
          useValue: mockUserPort,
        },
      ],
    }).compile();

    controller = app.get(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Basic path tests

  // 1. S1-C1-S2-FIN
  it('should throw BadRequestException when user creation fails', async () => {
    const mockCreateUserDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      password: 'securepassword',
      city: 'New York',
      country: 'USA',
    };
    mockUserPort.createUser.mockResolvedValue(
      left({ message: 'Email already exists' }),
    );

    await expect(controller.createUser(mockCreateUserDto)).rejects.toThrow(
      'Email already exists',
    );
  });

  // 2. S1-C1-S3-S4-S5-FIN
  it('should create a user and return CreateUserResponseDto', async () => {
    const mockUserId = uuidv4();
    const mockCreateUserDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      password: 'securepassword',
      city: 'New York',
      country: 'USA',
    };

    mockUserPort.createUser.mockResolvedValue(right({ id: mockUserId }));

    const response = await controller.createUser(mockCreateUserDto);

    expect(mockUserPort.createUser).toHaveBeenCalledWith(mockCreateUserDto);
    expect(response).toEqual({ userId: mockUserId });
  });
});
