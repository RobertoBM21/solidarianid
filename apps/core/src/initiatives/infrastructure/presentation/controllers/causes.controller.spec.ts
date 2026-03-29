import { left, right, UniqueEntityID } from '@app/shared/domain';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 } from 'uuid';
import { CommunityNotFoundError } from '../../../../communities/domain/repositories/community.repository';
import { CauseListItemDto } from '../../../application/dtos/cause-list-item.dto';
import { CausesPort } from '../../../application/ports/causes.port';
import { CreateCauseDto } from '../../../application/dtos/create-cause.dto';
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

      mockCausesPort.createCause.mockResolvedValue(right({ causeId: causeId }));

      const result = await controller.create(communityId, dto, userId);

      expect(result).toEqual({ causeId: causeId });
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
      const list: CauseListItemDto[] = [
        {
          id: causeId,
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
});
