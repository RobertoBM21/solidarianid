import {
  DomainEventsPort,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import { CommunityProposal } from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { CommunityProposalCreated } from '@app/shared/domain/events/community-proposal-created.event';
import { InvalidCommunityNameError } from '@app/shared/domain/value-objects/community-name.vo';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CommunityProposalNotFoundError,
  CommunityProposalsRepository,
} from '../../domain/repositories/community-proposals.repository';
import { CommunityProposalsService } from './community-proposals.service';

describe('CommunityProposalsService', () => {
  let service: CommunityProposalsService;

  const mockDomainEvents = {
    dispatch: jest.fn(),
  };

  const mockCommunityProposalsRepository = {
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityProposalsService,
        {
          provide: CommunityProposalsRepository,
          useValue: mockCommunityProposalsRepository,
        },
        {
          provide: DomainEventsPort,
          useValue: mockDomainEvents,
        },
      ],
    }).compile();

    service = module.get<CommunityProposalsService>(CommunityProposalsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listPendingProposals', () => {
    it('should return an array of community proposals', async () => {
      mockCommunityProposalsRepository.findAllPending.mockResolvedValue(
        mockProposals,
      );

      const proposals = await service.listPendingProposals();
      expect(proposals).toEqual(mockProposals);
      expect(
        mockCommunityProposalsRepository.findAllPending,
      ).toHaveBeenCalled();
    });
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

      const result = await service.handleNewProposal(event);

      expect(result.isRight()).toBe(true);
      expect(mockCommunityProposalsRepository.save).toHaveBeenCalled();
      const savedProposal: CommunityProposal =
        mockCommunityProposalsRepository.save.mock.calls[0][0];
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

      const result = await service.handleNewProposal(event);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InvalidCommunityNameError);
      }
      expect(mockCommunityProposalsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('approve', () => {
    it('should approve a community proposal', async () => {
      const proposal = mockProposals[0];
      const setAcceptedFn = jest.spyOn(proposal, 'setAccepted');

      const proposalId = proposal.id;
      mockCommunityProposalsRepository.findById.mockResolvedValueOnce(
        right(proposal),
      );

      const result = await service.approve(proposalId);

      expect(result.isRight()).toBe(true);
      expect(mockCommunityProposalsRepository.findById).toHaveBeenCalledWith(
        proposalId,
      );
      expect(mockCommunityProposalsRepository.save).toHaveBeenCalled();
      const savedProposal: CommunityProposal =
        mockCommunityProposalsRepository.save.mock.calls[0][0];
      expect(setAcceptedFn).toHaveBeenCalledWith(true);
      expect(savedProposal.accepted).toBe(true);
      expect(mockDomainEvents.dispatch).toHaveBeenCalledWith(savedProposal);
    });

    it('should return an error if proposal not found', async () => {
      const proposalId = UniqueEntityID.create();
      mockCommunityProposalsRepository.findById.mockResolvedValueOnce(
        left(new CommunityProposalNotFoundError(proposalId.toString())),
      );

      const result = await service.approve(proposalId);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(CommunityProposalNotFoundError);
      }
      expect(mockCommunityProposalsRepository.save).not.toHaveBeenCalled();
      expect(mockDomainEvents.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('reject', () => {
    it('should reject a community proposal', async () => {
      const proposal = mockProposals[1];
      const setAcceptedFn = jest.spyOn(proposal, 'setAccepted');

      const proposalId = proposal.id;
      mockCommunityProposalsRepository.findById.mockResolvedValueOnce(
        right(proposal),
      );

      const result = await service.reject(proposalId);

      expect(result.isRight()).toBe(true);
      expect(mockCommunityProposalsRepository.findById).toHaveBeenCalledWith(
        proposalId,
      );
      expect(mockCommunityProposalsRepository.save).toHaveBeenCalled();
      const savedProposal: CommunityProposal =
        mockCommunityProposalsRepository.save.mock.calls[0][0];
      expect(setAcceptedFn).toHaveBeenCalledWith(false);
      expect(savedProposal.accepted).toBe(false);
      expect(mockDomainEvents.dispatch).toHaveBeenCalledWith(savedProposal);
    });

    it('should return an error if proposal not found on reject', async () => {
      const proposalId = UniqueEntityID.create();
      mockCommunityProposalsRepository.findById.mockResolvedValueOnce(
        left(new CommunityProposalNotFoundError(proposalId.toString())),
      );

      const result = await service.reject(proposalId);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(CommunityProposalNotFoundError);
      }
      expect(mockCommunityProposalsRepository.save).not.toHaveBeenCalled();
      expect(mockDomainEvents.dispatch).not.toHaveBeenCalled();
    });
  });
});
