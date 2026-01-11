import {
  DomainEventsPort,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import { CommunityProposal } from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CommunityProposalNotFoundError,
  CommunityProposalRepository,
} from '../../domain/repositories/community-proposal.repository';
import { CommunityProposalsService } from './community-proposals.service';

describe('CommunityProposalsService', () => {
  let service: CommunityProposalsService;

  const mockDomainEvents = {
    dispatch: jest.fn(),
  };

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityProposalsService,
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
      mockCommunityProposalRepository.findAllPending.mockResolvedValue(
        mockProposals,
      );

      const proposals = await service.listPendingProposals();
      expect(proposals).toEqual(mockProposals);
      expect(mockCommunityProposalRepository.findAllPending).toHaveBeenCalled();
    });
  });

  describe('approve', () => {
    it('should approve a community proposal', async () => {
      const proposal = mockProposals[0];
      const setAcceptedFn = jest.spyOn(proposal, 'setAccepted');

      const proposalId = proposal.id;
      mockCommunityProposalRepository.findById.mockResolvedValueOnce(
        right(proposal),
      );

      const result = await service.approve(proposalId);

      expect(result.isRight()).toBe(true);
      expect(mockCommunityProposalRepository.findById).toHaveBeenCalledWith(
        proposalId,
      );
      expect(mockCommunityProposalRepository.save).toHaveBeenCalled();
      const savedProposal: CommunityProposal =
        mockCommunityProposalRepository.save.mock.calls[0][0];
      expect(setAcceptedFn).toHaveBeenCalledWith(true);
      expect(savedProposal.accepted).toBe(true);
      expect(mockDomainEvents.dispatch).toHaveBeenCalledWith(savedProposal);
    });

    it('should return an error if proposal not found', async () => {
      const proposalId = UniqueEntityID.create();
      mockCommunityProposalRepository.findById.mockResolvedValueOnce(
        left(new CommunityProposalNotFoundError(proposalId.toString())),
      );

      const result = await service.approve(proposalId);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(CommunityProposalNotFoundError);
      }
      expect(mockCommunityProposalRepository.save).not.toHaveBeenCalled();
      expect(mockDomainEvents.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('reject', () => {
    it('should reject a community proposal', async () => {
      const proposal = mockProposals[1];
      const setAcceptedFn = jest.spyOn(proposal, 'setAccepted');

      const proposalId = proposal.id;
      mockCommunityProposalRepository.findById.mockResolvedValueOnce(
        right(proposal),
      );

      const result = await service.reject(proposalId);

      expect(result.isRight()).toBe(true);
      expect(mockCommunityProposalRepository.findById).toHaveBeenCalledWith(
        proposalId,
      );
      expect(mockCommunityProposalRepository.save).toHaveBeenCalled();
      const savedProposal: CommunityProposal =
        mockCommunityProposalRepository.save.mock.calls[0][0];
      expect(setAcceptedFn).toHaveBeenCalledWith(false);
      expect(savedProposal.accepted).toBe(false);
      expect(mockDomainEvents.dispatch).toHaveBeenCalledWith(savedProposal);
    });

    it('should return an error if proposal not found on reject', async () => {
      const proposalId = UniqueEntityID.create();
      mockCommunityProposalRepository.findById.mockResolvedValueOnce(
        left(new CommunityProposalNotFoundError(proposalId.toString())),
      );

      const result = await service.reject(proposalId);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(CommunityProposalNotFoundError);
      }
      expect(mockCommunityProposalRepository.save).not.toHaveBeenCalled();
      expect(mockDomainEvents.dispatch).not.toHaveBeenCalled();
    });
  });
});
