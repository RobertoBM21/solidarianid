import { UniqueEntityID, left } from '@app/shared/domain';
import { CommunityProposalAccepted } from '@app/shared/domain/events/community-proposal-accepted.event';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Community,
  CommunityNameAlreadyExistsError,
} from '../../domain/community.aggregate';
import { CommunityFactory } from '../../domain/services/community-factory.service';
import { CommunityProposalAcceptedConsumer } from './community-proposal-accepted.consumer';

describe('CommunityProposalAcceptedConsumer', () => {
  let handler: CommunityProposalAcceptedConsumer;

  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

  const mockCommunityFactory = {
    createCommunity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityProposalAcceptedConsumer,
        {
          provide: CommunityFactory,
          useValue: mockCommunityFactory,
        },
      ],
    }).compile();

    handler = module.get<CommunityProposalAcceptedConsumer>(
      CommunityProposalAcceptedConsumer,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
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

      await handler.handleCommunityProposalAccepted(createData);

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

      await handler.handleCommunityProposalAccepted(createData);

      expect(mockCommunityFactory.createCommunity).toHaveBeenCalled();
    });
  });
});
