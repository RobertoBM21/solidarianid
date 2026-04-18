import { left, right, UniqueEntityID } from '@app/shared/domain';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 } from 'uuid';
import { CauseDto } from '../../../application/dtos/cause.dto';
import { CausesPort } from '../../../application/ports/causes.port';
import { CauseNotFoundError } from '../../../domain/repositories/cause-aggr.repository';
import { CauseController } from './cause.controller';

describe('CauseController', () => {
  const communityId = UniqueEntityID.create().toString();
  const causeId = UniqueEntityID.create().toString();

  let controller: CauseController;

  const mockCausesPort = {
    createCause: jest.fn(),
    listByCommunity: jest.fn(),
    getCause: jest.fn(),
    closeCause: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CauseController],
      providers: [
        {
          provide: CausesPort,
          useValue: mockCausesPort,
        },
      ],
    }).compile();

    controller = module.get(CauseController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('detail', () => {
    it('should return cause detail', async () => {
      const detail: CauseDto = {
        id: causeId,
        communityId,
        communityName: 'Test Community',
        title: 'Test Cause',
        description: 'Test Description',
        duration: '1 month',
        ods: 1,
        closed: false,
        createdAt: new Date(),
        actions: [],
      };
      const userId = v4();

      mockCausesPort.getCause.mockResolvedValue(right(detail));

      const result = await controller.detail(causeId, userId);

      expect(result).toEqual(detail);
      expect(mockCausesPort.getCause).toHaveBeenCalledWith(causeId, userId);
    });

    it('should throw 404 when cause not found', async () => {
      mockCausesPort.getCause.mockResolvedValue(
        left(new CauseNotFoundError(causeId)),
      );

      const result = controller.detail(causeId, undefined);

      await expect(result).rejects.toBeInstanceOf(NotFoundException);
      expect(mockCausesPort.getCause).toHaveBeenCalledWith(causeId, undefined);
    });

    it('should throw 400 on other errors', async () => {
      mockCausesPort.getCause.mockResolvedValue(left(new Error('boom')));
      const userId = v4();

      const result = controller.detail(causeId, userId);

      await expect(result).rejects.toBeInstanceOf(BadRequestException);
      expect(mockCausesPort.getCause).toHaveBeenCalledWith(causeId, userId);
    });
  });
});
