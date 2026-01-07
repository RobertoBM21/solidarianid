import { left, right } from '@app/shared/domain';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { InvalidCredentialsError } from '../../../domain/aggregates/admin-user.aggregate';
import { AuthPort } from '../../../domain/ports/auth.port';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthPort = {
    login: jest.fn(),
    register: jest.fn(),
  };

  const mockRequest = {
    session: {
      destroy: jest.fn((callback) => callback()),
      userId: undefined as string | undefined,
    },
  };

  const mockResponse = {
    render: jest.fn(),
    redirect: jest.fn(),
  };

  const request = mockRequest as unknown as Request;
  const response = mockResponse as unknown as Response;

  beforeEach(async () => {
    // Reset mocks
    mockRequest.session.userId = undefined;
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthPort,
          useValue: mockAuthPort,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('showLoginForm', () => {
    it('should return undefined (render)', () => {
      controller.showLoginForm();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password',
    };

    it('should set session userId on successful login', async () => {
      const userId = 'user-123';
      mockAuthPort.login.mockResolvedValue(right({ id: userId }));

      await controller.login(loginDto, request);

      expect(mockAuthPort.login).toHaveBeenCalledWith(loginDto);
      expect(mockRequest.session.userId).toBe(userId);
    });

    it('should throw BadRequestException on failed login', async () => {
      const error = new InvalidCredentialsError();
      mockAuthPort.login.mockResolvedValue(left(error));

      await expect(controller.login(loginDto, request)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockAuthPort.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('showRegisterForm', () => {
    it('should return undefined (render)', () => {
      controller.showRegisterForm();
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      name: 'Test',
      email: 'test@example.com',
      password: 'password',
      phone: '12345678',
    };

    it('should set session userId on successful register', async () => {
      const userId = 'user-123';
      mockAuthPort.register.mockResolvedValue(right({ id: userId }));

      await controller.register(registerDto, request);

      expect(mockAuthPort.register).toHaveBeenCalledWith(registerDto);
      expect(mockRequest.session.userId).toBe(userId);
    });

    it('should throw BadRequestException on failed register', async () => {
      const error = { message: 'Some error' };
      mockAuthPort.register.mockResolvedValue(left(error));

      await expect(controller.register(registerDto, request)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockAuthPort.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('logout', () => {
    it('should destroy session and redirect to login', () => {
      controller.logout(request, response);

      expect(mockRequest.session.destroy).toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalledWith('/auth/login');
    });
  });
});
