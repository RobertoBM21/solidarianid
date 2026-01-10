import { left, right, UniqueEntityID } from '@app/shared/domain';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 } from 'uuid';
import { CommunityNotFoundError } from '../../../../communities/domain/repositories/community.repository';
import { CauseDto } from '../../../application/dtos/cause.dto';
import { CausesPort } from '../../../application/ports/causes.port';
import { CauseNotFoundError } from '../../../domain/repositories/cause.repository';
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
        title: 't',
        description: 'd',
        duration: '1m',
        ods: 1,
        closed: false,
        createdAt: new Date().toISOString(),
        actions: [],
      };
      const userId = v4();

      mockCausesPort.getCause.mockResolvedValue(right(detail));

      const result = await controller.detail(causeId, userId);

      expect(result).toBe(detail);
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

  describe('close', () => {
    it('should call service and return void on success', async () => {
      mockCausesPort.closeCause.mockResolvedValue(right(undefined));

      const userId = v4();

      await controller.close(causeId, userId);

      expect(mockCausesPort.closeCause).toHaveBeenCalledWith(causeId, userId);
    });

    it('should throw 404 when community not found', async () => {
      mockCausesPort.closeCause.mockResolvedValue(
        left(new CommunityNotFoundError(communityId)),
      );

      const userId = v4();

      const result = controller.close(causeId, userId);

      await expect(result).rejects.toBeInstanceOf(NotFoundException);
      expect(mockCausesPort.closeCause).toHaveBeenCalledWith(causeId, userId);
    });

    it('should throw 400 on other errors', async () => {
      mockCausesPort.closeCause.mockResolvedValue(left(new Error('boom')));

      const userId = v4();

      const result = controller.close(causeId, userId);

      await expect(result).rejects.toBeInstanceOf(BadRequestException);
      expect(mockCausesPort.closeCause).toHaveBeenCalledWith(causeId, userId);
    });
  });
});
