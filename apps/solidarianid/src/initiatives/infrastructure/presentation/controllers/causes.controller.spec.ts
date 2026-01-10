import { left, right, UniqueEntityID } from '@app/shared/domain';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 } from 'uuid';
import { CommunityNotFoundError } from '../../../../communities/domain/repositories/community.repository';
import { CauseOut, CausesPort } from '../../../domain/ports/causes.port';
import { CauseNotFoundError } from '../../../domain/repositories/cause.repository';
import { CreateCauseDto } from '../dtos/create-cause.dto';
import { CausesController } from './causes.controller';

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
      const userId = v4();
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

      const result = await controller.create(communityId, dto, userId);

      expect(result).toBe(created);
      expect(mockCausesPort.createCause).toHaveBeenCalledWith(
        communityId,
        dto,
        userId,
      );
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
      const userId = v4();

      const result = controller.create(communityId, dto, userId);

      await expect(result).rejects.toBeInstanceOf(NotFoundException);
      expect(mockCausesPort.createCause).toHaveBeenCalledWith(
        communityId,
        dto,
        userId,
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
      const userId = v4();

      const result = controller.create(communityId, dto, userId);

      await expect(result).rejects.toBeInstanceOf(BadRequestException);
      expect(mockCausesPort.createCause).toHaveBeenCalledWith(
        communityId,
        dto,
        userId,
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

      const result = controller.list(communityId);

      await expect(result).rejects.toBeInstanceOf(NotFoundException);
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
      const userId = v4();

      mockCausesPort.getCause.mockResolvedValue(right(detail));

      const result = await controller.detail(communityId, causeId, userId);

      expect(result).toBe(detail);
      expect(mockCausesPort.getCause).toHaveBeenCalledWith(
        communityId,
        causeId,
        userId,
      );
    });

    it('should throw 404 when cause not found', async () => {
      mockCausesPort.getCause.mockResolvedValue(
        left(new CauseNotFoundError(causeId)),
      );

      const result = controller.detail(communityId, causeId, undefined);

      await expect(result).rejects.toBeInstanceOf(NotFoundException);
      expect(mockCausesPort.getCause).toHaveBeenCalledWith(
        communityId,
        causeId,
        undefined,
      );
    });

    it('should throw 400 on other errors', async () => {
      mockCausesPort.getCause.mockResolvedValue(left(new Error('boom')));
      const userId = v4();

      const result = controller.detail(communityId, causeId, userId);

      await expect(result).rejects.toBeInstanceOf(BadRequestException);
      expect(mockCausesPort.getCause).toHaveBeenCalledWith(
        communityId,
        causeId,
        userId,
      );
    });
  });

  describe('close', () => {
    it('should call service and return void on success', async () => {
      mockCausesPort.closeCause.mockResolvedValue(right(undefined));

      const userId = v4();

      await controller.close(communityId, causeId, userId);

      expect(mockCausesPort.closeCause).toHaveBeenCalledWith(
        communityId,
        causeId,
        userId,
      );
    });

    it('should throw 404 when community not found', async () => {
      mockCausesPort.closeCause.mockResolvedValue(
        left(new CommunityNotFoundError(communityId)),
      );

      const userId = v4();

      const result = controller.close(communityId, causeId, userId);

      await expect(result).rejects.toBeInstanceOf(NotFoundException);
      expect(mockCausesPort.closeCause).toHaveBeenCalledWith(
        communityId,
        causeId,
        userId,
      );
    });

    it('should throw 400 on other errors', async () => {
      mockCausesPort.closeCause.mockResolvedValue(left(new Error('boom')));

      const userId = v4();

      const result = controller.close(communityId, causeId, userId);

      await expect(result).rejects.toBeInstanceOf(BadRequestException);
      expect(mockCausesPort.closeCause).toHaveBeenCalledWith(
        communityId,
        causeId,
        userId,
      );
    });
  });
});
