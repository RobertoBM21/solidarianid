import { DomainEventsPort, UniqueEntityID } from '@app/shared/domain';
import { CommunityProposal } from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { CommunityProposalAccepted } from '@app/shared/domain/events/community-proposal-accepted.event';
import { Test, TestingModule } from '@nestjs/testing';
import { CommunityProposalRepository } from '../../domain/repositories/community-proposal.repository';
import { CommunityProposalAcceptedHandler } from './community-proposal-accepted.handler';

describe('CommunityProposalAcceptedHandler', () => {
  let handler: CommunityProposalAcceptedHandler;

  const mockDomainEvents = {
    dispatch: jest.fn(),
  };

  const mockCommunityProposalRepository = {
    findPendingByName: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityProposalAcceptedHandler,
        {
          provide: CommunityProposalRepository,
          useValue: mockCommunityProposalRepository,
        },
        {
          provide: DomainEventsPort,
          useValue: mockDomainEvents,
        },
      ],
    }).compile();

    handler = module.get<CommunityProposalAcceptedHandler>(
      CommunityProposalAcceptedHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should reject other proposals with the same name', async () => {
    const approvedProposalId = UniqueEntityID.create().toString();
    const otherProposal = CommunityProposal.create({
      name: 'Test Community',
      description: 'Description',
      requesterId: UniqueEntityID.create().toString(),
      accepted: null,
    });

    if (otherProposal.isLeft()) {
      return otherProposal;
    }

    const proposal = otherProposal.value;
    const setAcceptedSpy = jest.spyOn(proposal, 'setAccepted');

    mockCommunityProposalRepository.findPendingByName.mockResolvedValue([
      proposal,
    ]);

    const event: CommunityProposalAccepted = {
      proposalId: approvedProposalId,
      name: 'Test Community',
      description: 'Approved Description',
      requesterId: UniqueEntityID.create().toString(),
      occurredOn: new Date(),
    };

    await handler.handle(event);

    expect(
      mockCommunityProposalRepository.findPendingByName,
    ).toHaveBeenCalledWith('Test Community');
    expect(setAcceptedSpy).toHaveBeenCalledWith(false);
    expect(mockCommunityProposalRepository.save).toHaveBeenCalledWith(proposal);
    expect(mockDomainEvents.dispatch).toHaveBeenCalledWith(proposal);
  });

  it('should not reject the approved proposal itself', async () => {
    const approvedProposal = CommunityProposal.create({
      name: 'Test Community',
      description: 'Description',
      requesterId: UniqueEntityID.create().toString(),
      accepted: null,
      createdAt: new Date(),
    });

    if (approvedProposal.isLeft()) {
      return approvedProposal;
    }

    const proposal = approvedProposal.value;
    const approvedProposalId = proposal.id.toString();
    const setAcceptedSpy = jest.spyOn(proposal, 'setAccepted');

    mockCommunityProposalRepository.findPendingByName.mockResolvedValue([
      proposal,
    ]);

    const event: CommunityProposalAccepted = {
      proposalId: approvedProposalId,
      name: 'Test Community',
      description: 'Approved Description',
      requesterId: UniqueEntityID.create().toString(),
      occurredOn: new Date(),
    };

    await handler.handle(event);

    expect(
      mockCommunityProposalRepository.findPendingByName,
    ).toHaveBeenCalledWith('Test Community');
    expect(setAcceptedSpy).not.toHaveBeenCalled();
    expect(mockCommunityProposalRepository.save).not.toHaveBeenCalled();
    expect(mockDomainEvents.dispatch).not.toHaveBeenCalled();
  });

  it('should reject multiple proposals with the same name', async () => {
    const approvedProposalId = UniqueEntityID.create().toString();
    const proposal1Result = CommunityProposal.create({
      name: 'Test Community',
      description: 'Description 1',
      requesterId: UniqueEntityID.create().toString(),
      accepted: null,
      createdAt: new Date(),
    });
    const proposal2Result = CommunityProposal.create({
      name: 'Test Community',
      description: 'Description 2',
      requesterId: UniqueEntityID.create().toString(),
      accepted: null,
      createdAt: new Date(),
    });

    if (proposal1Result.isLeft()) {
      return proposal1Result;
    }

    if (proposal2Result.isLeft()) {
      return proposal2Result;
    }

    const proposal1 = proposal1Result.value;
    const proposal2 = proposal2Result.value;

    mockCommunityProposalRepository.findPendingByName.mockResolvedValue([
      proposal1,
      proposal2,
    ]);

    const event: CommunityProposalAccepted = {
      proposalId: approvedProposalId,
      name: 'Test Community',
      description: 'Approved Description',
      requesterId: UniqueEntityID.create().toString(),
      occurredOn: new Date(),
    };

    await handler.handle(event);

    expect(mockCommunityProposalRepository.save).toHaveBeenCalledTimes(2);
    expect(mockDomainEvents.dispatch).toHaveBeenCalledTimes(2);
  });

  it('should continue when rejection fails for one proposal', async () => {
    const approvedProposalId = UniqueEntityID.create().toString();
    const proposal1Result = CommunityProposal.create({
      name: 'Test Community',
      description: 'Description 1',
      requesterId: UniqueEntityID.create().toString(),
      accepted: false, // Already rejected
      createdAt: new Date(),
    });
    const proposal2Result = CommunityProposal.create({
      name: 'Test Community',
      description: 'Description 2',
      requesterId: UniqueEntityID.create().toString(),
      accepted: null,
      createdAt: new Date(),
    });

    if (proposal1Result.isLeft()) {
      return proposal1Result;
    }

    if (proposal2Result.isLeft()) {
      return proposal2Result;
    }

    const proposal1 = proposal1Result.value;
    const proposal2 = proposal2Result.value;

    mockCommunityProposalRepository.findPendingByName.mockResolvedValue([
      proposal1,
      proposal2,
    ]);

    const event: CommunityProposalAccepted = {
      proposalId: approvedProposalId,
      name: 'Test Community',
      description: 'Approved Description',
      requesterId: UniqueEntityID.create().toString(),
      occurredOn: new Date(),
    };

    await handler.handle(event);

    expect(mockCommunityProposalRepository.save).toHaveBeenCalledTimes(1);
    expect(mockCommunityProposalRepository.save).toHaveBeenCalledWith(
      proposal2,
    );
    expect(mockDomainEvents.dispatch).toHaveBeenCalledTimes(1);
  });

  it('should handle empty list of proposals', async () => {
    mockCommunityProposalRepository.findPendingByName.mockResolvedValue([]);

    const event: CommunityProposalAccepted = {
      proposalId: UniqueEntityID.create().toString(),
      name: 'Test Community',
      description: 'Approved Description',
      requesterId: UniqueEntityID.create().toString(),
      occurredOn: new Date(),
    };

    await handler.handle(event);

    expect(
      mockCommunityProposalRepository.findPendingByName,
    ).toHaveBeenCalledWith('Test Community');
    expect(mockCommunityProposalRepository.save).not.toHaveBeenCalled();
    expect(mockDomainEvents.dispatch).not.toHaveBeenCalled();
  });
});
