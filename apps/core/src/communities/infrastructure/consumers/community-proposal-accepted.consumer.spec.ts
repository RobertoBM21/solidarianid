import { UniqueEntityID } from '@app/shared/domain';
import { CommunityProposalAccepted } from '@app/shared/domain/events/community-proposal-accepted.event';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HandleCommunityProposalAcceptedPort } from '../../application/ports/handle-community-proposal-accepted.port';
import { CommunityProposalAcceptedConsumer } from './community-proposal-accepted.consumer';

describe('CommunityProposalAcceptedConsumer', () => {
  let handler: CommunityProposalAcceptedConsumer;

  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

  const mockHandleProposalAccepted = {
    handle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityProposalAcceptedConsumer,
        {
          provide: HandleCommunityProposalAcceptedPort,
          useValue: mockHandleProposalAccepted,
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
    it('should delegate to HandleCommunityProposalAcceptedPort', async () => {
      const event: CommunityProposalAccepted = {
        name: 'Created Community',
        description: 'Created Description',
        requesterId: UniqueEntityID.create().toString(),
        proposalId: UniqueEntityID.create().toString(),
        occurredOn: new Date(),
      };

      mockHandleProposalAccepted.handle.mockResolvedValue(undefined);

      await handler.handleCommunityProposalAccepted(event);

      expect(mockHandleProposalAccepted.handle).toHaveBeenCalledWith({
        name: event.name,
        description: event.description,
        requesterId: event.requesterId,
        proposalId: event.proposalId,
      });
    });
  });
});
