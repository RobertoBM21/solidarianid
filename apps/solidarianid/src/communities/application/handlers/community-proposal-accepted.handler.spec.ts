import { UniqueEntityID, left } from '@app/shared/domain';
import { CommunityProposalAccepted } from '@app/shared/domain/events/community-proposal-accepted.event';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Community,
  CommunityNameAlreadyExistsError,
} from '../../domain/community.aggregate';
import { CommunityFactory } from '../../domain/services/community-factory.service';
import { CommunityProposalAcceptedHandler } from './community-proposal-accepted.handler';

describe('CommunityProposalAcceptedHandler', () => {
  let handler: CommunityProposalAcceptedHandler;

  const mockCommunityFactory = {
    createCommunity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityProposalAcceptedHandler,
        {
          provide: CommunityFactory,
          useValue: mockCommunityFactory,
        },
      ],
    }).compile();

    handler = module.get(CommunityProposalAcceptedHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

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

    await handler.handle(createData);

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

    await handler.handle(createData);

    expect(mockCommunityFactory.createCommunity).toHaveBeenCalled();
  });
});
