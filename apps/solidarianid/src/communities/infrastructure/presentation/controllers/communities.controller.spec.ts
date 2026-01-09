import { left, right } from '@app/shared/domain';
import { CommunityProposalAccepted } from '@app/shared/domain/events/community-proposal-accepted.event';
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
    createCommunity: jest.fn().mockResolvedValue(undefined),
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

  describe('handleCommunityProposalAccepted', () => {
    it('should call createCommunity method of CommunitiesService with correct parameters', async () => {
      const event: CommunityProposalAccepted = {
        proposalId: v4(),
        name: 'Accepted Community',
        description: 'Accepted Description',
        requesterId: v4(),
        occurredOn: new Date(),
      };

      mockCommunitiesService.createCommunity.mockResolvedValue(
        right({
          id: v4(),
          name: event.name,
          description: event.description,
          createdAt: new Date().toISOString(),
        }),
      );

      await controller.handleCommunityProposalAccepted(event);

      expect(mockCommunitiesService.createCommunity).toHaveBeenCalledTimes(1);
      expect(mockCommunitiesService.createCommunity).toHaveBeenCalledWith(
        expect.objectContaining({
          name: event.name,
          description: event.description,
          requesterId: event.requesterId,
        }),
      );
    });

    it('should handle errors thrown by CommunitiesService', async () => {
      const event: CommunityProposalAccepted = {
        proposalId: v4(),
        name: '', // Invalid name to trigger error
        description: 'Accepted Description',
        requesterId: v4(),
        occurredOn: new Date(),
      };

      const errorMessage = 'Error creating community';
      mockCommunitiesService.createCommunity.mockResolvedValue(
        left(new InvalidCommunityNameError(errorMessage)),
      );

      await expect(
        controller.handleCommunityProposalAccepted(event),
      ).rejects.toThrow(Error);

      expect(mockCommunitiesService.createCommunity).toHaveBeenCalledTimes(1);
      expect(mockCommunitiesService.createCommunity).toHaveBeenCalledWith(
        expect.objectContaining({
          name: event.name,
          description: event.description,
          requesterId: event.requesterId,
        }),
      );
    });
  });
});
