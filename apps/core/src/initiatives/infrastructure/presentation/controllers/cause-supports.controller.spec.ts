import { left, right, UniqueEntityID } from '@app/shared/domain';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CauseSupportsPort } from '../../../application/ports/cause-supports.port';
import { CauseNotFoundError } from '../../../domain/repositories/cause-aggr.repository';
import { CauseSupportsController } from './cause-supports.controller';

describe('CauseSupportsController', () => {
  const causeId = UniqueEntityID.create().toString();
  const userId = UniqueEntityID.create().toString();
  let controller: CauseSupportsController;
  const mockCauseSupportsPort = {
    registerSupportForUser: jest.fn(),
    registerSupportForAnonymous: jest.fn(),
    cancelSupport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CauseSupportsController],
      providers: [
        {
          provide: CauseSupportsPort,
          useValue: mockCauseSupportsPort,
        },
      ],
    }).compile();

    controller = module.get<CauseSupportsController>(CauseSupportsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('supportRegistered', () => {
    it('should register support for user', async () => {
      mockCauseSupportsPort.registerSupportForUser.mockResolvedValue(
        right(undefined),
      );

      await controller.supportRegistered(causeId, userId);

      expect(mockCauseSupportsPort.registerSupportForUser).toHaveBeenCalledWith(
        {
          causeId,
          userId,
        },
      );
    });

    it('should map cause not found to 404', async () => {
      mockCauseSupportsPort.registerSupportForUser.mockResolvedValue(
        left(new CauseNotFoundError(causeId)),
      );

      await expect(
        controller.supportRegistered(causeId, userId),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('supportAnonymous', () => {
    it('should register anonymous support', async () => {
      mockCauseSupportsPort.registerSupportForAnonymous.mockResolvedValue(
        right(undefined),
      );

      await controller.supportAnonymous(causeId, {
        email: 'anon@test.com',
        name: 'Anon',
      });

      expect(
        mockCauseSupportsPort.registerSupportForAnonymous,
      ).toHaveBeenCalledWith({
        causeId,
        data: {
          email: 'anon@test.com',
          name: 'Anon',
        },
      });
    });

    it('should map cause not found to 404', async () => {
      mockCauseSupportsPort.registerSupportForAnonymous.mockResolvedValue(
        left(new CauseNotFoundError(causeId)),
      );

      await expect(
        controller.supportAnonymous(causeId, {
          email: 'anon@test.com',
          name: 'Anon',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('cancelSupport', () => {
    it('should cancel support for user', async () => {
      mockCauseSupportsPort.cancelSupport.mockResolvedValue(right(undefined));

      await controller.cancelSupport(causeId, userId);

      expect(mockCauseSupportsPort.cancelSupport).toHaveBeenCalledWith(
        causeId,
        userId,
      );
    });

    it('should map cause not found to 404', async () => {
      mockCauseSupportsPort.cancelSupport.mockResolvedValue(
        left(new CauseNotFoundError(causeId)),
      );

      await expect(
        controller.cancelSupport(causeId, userId),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
