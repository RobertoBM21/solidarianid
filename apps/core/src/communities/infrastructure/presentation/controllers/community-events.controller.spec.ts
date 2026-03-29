import { UniqueEntityID, left } from '@app/shared/domain';
import { CommunityProposalAccepted } from '@app/shared/domain/events/community-proposal-accepted.event';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CommunityStatisticsPort } from '../../../application/ports/community-statistics.port';
import {
  Community,
  CommunityNameAlreadyExistsError,
} from '../../../domain/community.aggregate';
import { CommunityFactory } from '../../../domain/services/community-factory.service';
import { CommunityEventsController } from './community-events.controller';

describe('CommunityEventsController', () => {
  let controller: CommunityEventsController;

  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

  const mockCommunityFactory = {
    createCommunity: jest.fn(),
  };

  const mockCommunityStatisticsPort = {
    getCommunitiesStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CommunityFactory,
          useValue: mockCommunityFactory,
        },
        {
          provide: CommunityStatisticsPort,
          useValue: mockCommunityStatisticsPort,
        },
      ],
      controllers: [CommunityEventsController],
    }).compile();

    controller = module.get(CommunityEventsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleCommunityProposalAccepted', () => {
    it('should create a new community', async () => {
      const createData: CommunityProposalAccepted = {
        name: 'Created Community',
        description: 'Created Description',
        requesterId: UniqueEntityID.create().toString(),
        proposalId: UniqueEntityID.create().toString(),
        occurredOn: new Date(),
      };

      mockCommunityFactory.createCommunity.mockResolvedValue(
        Community.create({
          name: createData.name,
          description: createData.description,
          admins: [createData.requesterId],
          causes: [],
        }),
      );

      await controller.handleCommunityProposalAccepted(createData);

      expect(mockCommunityFactory.createCommunity).toHaveBeenCalledWith({
        name: createData.name,
        description: createData.description,
        adminId: createData.requesterId,
      });
    });

    it('should reject creation on factory error', async () => {
      const createData: CommunityProposalAccepted = {
        name: 'Community 1',
        description: 'Description 1',
        requesterId: UniqueEntityID.create().toString(),
        proposalId: UniqueEntityID.create().toString(),
        occurredOn: new Date(),
      };

      mockCommunityFactory.createCommunity.mockResolvedValue(
        left(new CommunityNameAlreadyExistsError(createData.name)),
      );

      await controller.handleCommunityProposalAccepted(createData);

      expect(mockCommunityFactory.createCommunity).toHaveBeenCalled();
    });
  });
});
