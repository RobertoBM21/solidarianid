import { BadRequestException, NotFoundException } from '@nestjs/common';
import { left, right, UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { CommunityNotFoundError } from '../../../../communities/domain/repositories/community.repository';
import { CauseNotFoundError } from '../../../domain/repositories/cause.repository';
import { CauseOut, CausesPort } from '../../../domain/ports/causes.port';
import { CausesController } from './causes.controller';
import { CreateCauseDto } from '../dtos/create-cause.dto';

describe('CausesController', () => {
  const communityId = UniqueEntityID.create().toString();
  const causeId = UniqueEntityID.create().toString();
  let controller: CausesController;
  const mockCausesPort = {
    createCause: jest.fn(),
    listByCommunity: jest.fn(),
    getCause: jest.fn(),
    closeCause: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CausesController],
      providers: [
        {
          provide: CausesPort,
          useValue: mockCausesPort,
        },
      ],
    }).compile();

    controller = module.get<CausesController>(CausesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return created cause when service succeeds', async () => {
      const dto: CreateCauseDto = {
        title: 't',
        description: 'd',
        duration: '1m',
        ods: 1,
      };
      const created: CauseOut = {
        id: causeId,
        communityId,
        title: dto.title,
        description: dto.description,
        duration: dto.duration,
        ods: dto.ods,
        closed: false,
        createdAt: new Date().toISOString(),
      };
      mockCausesPort.createCause.mockResolvedValue(right(created));

      const result = await controller.create(communityId, dto);

      expect(result).toBe(created);
      expect(mockCausesPort.createCause).toHaveBeenCalledWith(communityId, dto);
    });

    it('should throw 404 when community not found', async () => {
      mockCausesPort.createCause.mockResolvedValue(
        left(new CommunityNotFoundError(communityId)),
      );

      const dto: CreateCauseDto = {
        title: 't',
        description: 'd',
        duration: '1m',
        ods: 1,
      };

      await expect(controller.create(communityId, dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should throw 400 on other errors', async () => {
      mockCausesPort.createCause.mockResolvedValue(left(new Error('boom')));

      const dto: CreateCauseDto = {
        title: 't',
        description: 'd',
        duration: '1m',
        ods: 1,
      };

      await expect(controller.create(communityId, dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('list', () => {
    it('should return list of causes', async () => {
      const list: CauseOut[] = [
        {
          id: causeId,
          communityId,
          title: 't',
          description: 'd',
          duration: '1m',
          ods: 1,
          closed: false,
          createdAt: new Date().toISOString(),
        },
      ];
      mockCausesPort.listByCommunity.mockResolvedValue(right(list));

      const result = await controller.list(communityId);

      expect(result).toBe(list);
      expect(mockCausesPort.listByCommunity).toHaveBeenCalledWith(communityId);
    });

    it('should throw 404 when community not found', async () => {
      mockCausesPort.listByCommunity.mockResolvedValue(
        left(new CommunityNotFoundError(communityId)),
      );

      await expect(controller.list(communityId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('detail', () => {
    it('should return cause detail', async () => {
      const detail: CauseOut = {
        id: causeId,
        communityId,
        title: 't',
        description: 'd',
        duration: '1m',
        ods: 1,
        closed: false,
        createdAt: new Date().toISOString(),
      };
      mockCausesPort.getCause.mockResolvedValue(right(detail));

      const result = await controller.detail(communityId, causeId, undefined);

      expect(result).toBe(detail);
      expect(mockCausesPort.getCause).toHaveBeenCalledWith(
        communityId,
        causeId,
        undefined,
      );
    });

    it('should throw 404 when cause not found', async () => {
      mockCausesPort.getCause.mockResolvedValue(
        left(new CauseNotFoundError(causeId)),
      );

      await expect(
        controller.detail(communityId, causeId, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw 400 on other errors', async () => {
      mockCausesPort.getCause.mockResolvedValue(left(new Error('boom')));

      await expect(
        controller.detail(communityId, causeId, undefined),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('close', () => {
    it('should call service and return void on success', async () => {
      mockCausesPort.closeCause.mockResolvedValue(right(undefined));

      await controller.close(communityId, causeId);

      expect(mockCausesPort.closeCause).toHaveBeenCalledWith(
        communityId,
        causeId,
      );
    });

    it('should throw 404 when community not found', async () => {
      mockCausesPort.closeCause.mockResolvedValue(
        left(new CommunityNotFoundError(communityId)),
      );

      await expect(
        controller.close(communityId, causeId),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw 400 on other errors', async () => {
      mockCausesPort.closeCause.mockResolvedValue(left(new Error('boom')));

      await expect(
        controller.close(communityId, causeId),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
