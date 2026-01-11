import { left, right } from '@app/shared/domain';
import { InvalidCommunityNameError } from '@app/shared/domain/value-objects/community-name.vo';
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { v4 } from 'uuid';
import { CommunityOutDto } from '../../../application/dtos/community-out.dto';
import { CommunitiesPort } from '../../../domain/ports/community.port';
import { CommunitiesController } from './communities.controller';

describe('CommunitiesController', () => {
  let controller: CommunitiesController;

  const mockCommunitiesService = {
    listCommunities: jest.fn().mockResolvedValue([]),
    proposeCommunity: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [CommunitiesController],
      providers: [
        {
          provide: CommunitiesPort,
          useValue: mockCommunitiesService,
        },
      ],
    }).compile();

    controller = app.get(CommunitiesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an array of communities', async () => {
    const mockCommunities: CommunityOutDto[] = [
      {
        id: '1',
        name: 'Community A',
        description: 'Description A',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Community B',
        description: 'Description B',
        createdAt: new Date().toISOString(),
      },
    ];

    mockCommunitiesService.listCommunities.mockResolvedValue(mockCommunities);

    const data = await controller.list();

    expect(data).toEqual(mockCommunities);
    expect(mockCommunitiesService.listCommunities).toHaveBeenCalledTimes(1);
  });

  describe('proposeCommunity', () => {
    it('should call proposeCommunity method of CommunitiesPort with correct parameters', async () => {
      const dto = {
        name: 'New Community',
        description: 'New Description',
      };
      const userId = v4();
      mockCommunitiesService.proposeCommunity.mockResolvedValue(
        right({ proposalId: '12345' }),
      );

      const result = await controller.proposeCommunity(dto, userId);

      expect(mockCommunitiesService.proposeCommunity).toHaveBeenCalledTimes(1);
      expect(mockCommunitiesService.proposeCommunity).toHaveBeenCalledWith(
        dto,
        userId,
      );
      expect(result).toHaveProperty('proposalId');
    });

    it('should handle errors thrown by CommunitiesPort', async () => {
      const dto = {
        name: 'New Community',
        description: 'New Description',
      };

      const errorMessage = 'invalid community name';
      mockCommunitiesService.proposeCommunity.mockResolvedValue(
        left(new InvalidCommunityNameError(errorMessage)),
      );

      await expect(controller.proposeCommunity(dto, v4())).rejects.toThrow(
        BadRequestException,
      );
      expect(mockCommunitiesService.proposeCommunity).toHaveBeenCalledTimes(1);
      expect(mockCommunitiesService.proposeCommunity).toHaveBeenCalledWith(
        dto,
        expect.any(String),
      );
    });
  });
});
