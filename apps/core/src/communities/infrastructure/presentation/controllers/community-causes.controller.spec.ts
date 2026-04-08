import { left, right, UniqueEntityID } from '@app/shared/domain';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateCauseDto } from '../../../../communities/application/dtos/create-cause.dto';
import { CommunityNotFoundError } from '../../../../communities/domain/repositories/community.repository';
import { CauseDto } from '../../../application/dtos/community-out.dto';
import { CommunitiesPort } from '../../../application/ports/communities.port';
import { Cause } from '../../../domain/entities/cause.entity';
import { CommunityCausesController } from './community-causes.controller';

describe('CommunityCausesController', () => {
  const communityId = UniqueEntityID.create();
  const causeId = UniqueEntityID.create();
  const userId = UniqueEntityID.create();

  let controller: CommunityCausesController;

  const mockCommunitiesPort: jest.Mocked<
    Pick<CommunitiesPort, 'createCause' | 'closeCause'>
  > = {
    createCause: jest.fn(),
    closeCause: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityCausesController],
      providers: [
        {
          provide: CommunitiesPort,
          useValue: mockCommunitiesPort,
        },
      ],
    }).compile();

    controller = module.get(CommunityCausesController);
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
      const cause = Cause.create(dto, causeId.toString()).value as Cause;
      expect(cause.id).toEqual(causeId);

      mockCommunitiesPort.createCause.mockResolvedValue(right(cause));

      const result = await controller.create(
        communityId.toString(),
        dto,
        userId.toString(),
      );

      expect(result).toEqual(new CauseDto(cause));
      expect(mockCommunitiesPort.createCause).toHaveBeenCalledWith(
        dto,
        communityId,
        userId,
      );
    });

    it('should throw 404 when community not found', async () => {
      mockCommunitiesPort.createCause.mockResolvedValue(
        left(new CommunityNotFoundError(communityId.toString())),
      );

      const dto: CreateCauseDto = {
        title: 't',
        description: 'd',
        duration: '1m',
        ods: 1,
      };
      const userId = UniqueEntityID.create();

      const result = controller.create(
        communityId.toString(),
        dto,
        userId.toString(),
      );

      await expect(result).rejects.toBeInstanceOf(NotFoundException);
      expect(mockCommunitiesPort.createCause).toHaveBeenCalledWith(
        dto,
        communityId,
        userId,
      );
    });

    it('should throw 400 on other errors', async () => {
      mockCommunitiesPort.createCause.mockResolvedValue(
        left(new Error('boom')),
      );

      const dto: CreateCauseDto = {
        title: 't',
        description: 'd',
        duration: '1m',
        ods: 1,
      };
      const userId = UniqueEntityID.create();

      const result = controller.create(
        communityId.toString(),
        dto,
        userId.toString(),
      );

      await expect(result).rejects.toBeInstanceOf(BadRequestException);
      expect(mockCommunitiesPort.createCause).toHaveBeenCalledWith(
        dto,
        communityId,
        userId,
      );
    });
  });

  describe('close', () => {
    it('should call service and return void on success', async () => {
      mockCommunitiesPort.closeCause.mockResolvedValue(right(undefined));

      const userId = UniqueEntityID.create();

      await controller.close(
        communityId.toString(),
        causeId.toString(),
        userId.toString(),
      );

      expect(mockCommunitiesPort.closeCause).toHaveBeenCalledWith(
        communityId,
        causeId,
        userId,
      );
    });

    it('should throw 404 when community not found', async () => {
      mockCommunitiesPort.closeCause.mockResolvedValue(
        left(new CommunityNotFoundError(communityId.toString())),
      );

      const userId = UniqueEntityID.create();

      const result = controller.close(
        communityId.toString(),
        causeId.toString(),
        userId.toString(),
      );

      await expect(result).rejects.toBeInstanceOf(NotFoundException);
      expect(mockCommunitiesPort.closeCause).toHaveBeenCalledWith(
        communityId,
        causeId,
        userId,
      );
    });

    it('should throw 400 on other errors', async () => {
      mockCommunitiesPort.closeCause.mockResolvedValue(left(new Error('boom')));

      const userId = UniqueEntityID.create();

      const result = controller.close(
        communityId.toString(),
        causeId.toString(),
        userId.toString(),
      );

      await expect(result).rejects.toBeInstanceOf(BadRequestException);
      expect(mockCommunitiesPort.closeCause).toHaveBeenCalledWith(
        communityId,
        causeId,
        userId,
      );
    });
  });
});
