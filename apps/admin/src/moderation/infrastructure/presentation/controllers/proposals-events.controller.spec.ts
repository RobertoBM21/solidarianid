import { UniqueEntityID } from '@app/shared/domain';
import { CommunityProposal } from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { CommunityProposalCreated } from '@app/shared/domain/events/community-proposal-created.event';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CommunityProposalRepository } from '../../../domain/repositories/community-proposal.repository';
import { ProposalsEventsController } from './proposals-events.controller';

describe('ProposalsEventsController', () => {
  let controller: ProposalsEventsController;

  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

  const mockCommunityProposalRepository = {
    findById: jest.fn(),
    findAllPending: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockProposals: CommunityProposal[] = [];
  const proposal1 = CommunityProposal.create({
    name: 'Community 1',
    description: 'Description 1',
    requesterId: UniqueEntityID.create().toString(),
    accepted: null,
    createdAt: new Date(),
  });
  if (proposal1.isRight()) {
    mockProposals.push(proposal1.value);
  }
  const proposal2 = CommunityProposal.create({
    name: 'Community 2',
    description: 'Description 2',
    requesterId: UniqueEntityID.create().toString(),
    accepted: null,
    createdAt: new Date(),
  });
  if (proposal2.isRight()) {
    mockProposals.push(proposal2.value);
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        ProposalsEventsController,
        {
          provide: CommunityProposalRepository,
          useValue: mockCommunityProposalRepository,
        },
      ],
    }).compile();

    controller = app.get<ProposalsEventsController>(ProposalsEventsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleNewProposal', () => {
    it('should handle a new community proposal event', async () => {
      const event: CommunityProposalCreated = {
        proposalId: UniqueEntityID.create().toString(),
        name: 'New Community',
        description: 'New Description',
        requesterId: UniqueEntityID.create().toString(),
        occurredOn: new Date(),
      };

      await controller.handleProposalCreated(event);

      expect(mockCommunityProposalRepository.save).toHaveBeenCalled();
      const savedProposal: CommunityProposal =
        mockCommunityProposalRepository.save.mock.calls[0][0];
      expect(savedProposal).toBeInstanceOf(CommunityProposal);
      expect(savedProposal.name).toBe(event.name);
      expect(savedProposal.description).toBe(event.description);
      expect(savedProposal.requesterId).toBe(event.requesterId);
      expect(savedProposal.accepted).toBeNull();
    });

    it('should return an error if proposal creation fails', async () => {
      const event: CommunityProposalCreated = {
        proposalId: UniqueEntityID.create().toString(),
        name: '', // Invalid name to trigger creation error
        description: 'New Description',
        requesterId: UniqueEntityID.create().toString(),
        occurredOn: new Date(),
      };

      await controller.handleProposalCreated(event);

      expect(mockCommunityProposalRepository.save).not.toHaveBeenCalled();
    });
  });
});
