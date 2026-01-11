import { left, right, UniqueEntityID } from '@app/shared/domain';
import {
  CommunityProposal,
  InvalidProposalStateError,
} from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CommunityProposalsPort } from '../../../application/ports/community-proposals.port';
import { CommunityProposalNotFoundError } from '../../../domain/repositories/community-proposal.repository';
import { CommunityProposalsController } from './community-proposals.controller';

describe('CommunityProposalsController', () => {
  let controller: CommunityProposalsController;

  const mockCommunityProposalsPort = {
    listPendingProposals: jest.fn().mockResolvedValue([]),
    handleNewProposal: jest.fn().mockResolvedValue(undefined),
    approve: jest.fn().mockResolvedValue(undefined),
    reject: jest.fn().mockResolvedValue(undefined),
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
      controllers: [CommunityProposalsController],
      providers: [
        {
          provide: CommunityProposalsPort,
          useValue: mockCommunityProposalsPort,
        },
      ],
    }).compile();

    controller = app.get<CommunityProposalsController>(
      CommunityProposalsController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return proposals list view options', async () => {
    mockCommunityProposalsPort.listPendingProposals.mockResolvedValue(
      mockProposals,
    );

    const result = await controller.listProposals();

    expect(mockCommunityProposalsPort.listPendingProposals).toHaveBeenCalled();
    expect(result).toEqual({
      title: 'Solicitudes de comunidad',
      proposals: mockProposals,
    });
  });

  describe('approveProposal', () => {
    it('should approve proposal successfully', async () => {
      const proposalId = UniqueEntityID.create().toString();

      mockCommunityProposalsPort.approve = jest
        .fn()
        .mockResolvedValue(right(proposal1.value));

      await controller.approveProposal(proposalId);

      expect(mockCommunityProposalsPort.approve).toHaveBeenCalledWith(
        proposalId,
      );
    });

    it('should throw NotFoundException if proposal not found during approval', async () => {
      const proposalId = UniqueEntityID.create().toString();

      mockCommunityProposalsPort.approve.mockResolvedValue(
        left(new CommunityProposalNotFoundError(proposalId)),
      );

      await expect(controller.approveProposal(proposalId)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockCommunityProposalsPort.approve).toHaveBeenCalledWith(
        proposalId,
      );
    });

    it('should throw BadRequestException for other approval errors', async () => {
      const proposalId = UniqueEntityID.create().toString();

      mockCommunityProposalsPort.approve.mockResolvedValue(
        left(new InvalidProposalStateError()),
      );

      await expect(controller.approveProposal(proposalId)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockCommunityProposalsPort.approve).toHaveBeenCalledWith(
        proposalId,
      );
    });
  });

  describe('rejectProposal', () => {
    it('should reject proposal successfully', async () => {
      const proposalId = UniqueEntityID.create().toString();

      mockCommunityProposalsPort.reject = jest
        .fn()
        .mockResolvedValue(right(proposal2.value));

      await controller.rejectProposal(proposalId);

      expect(mockCommunityProposalsPort.reject).toHaveBeenCalledWith(
        proposalId,
      );
    });

    it('should throw NotFoundException if proposal not found during rejection', async () => {
      const proposalId = UniqueEntityID.create().toString();

      mockCommunityProposalsPort.reject = jest
        .fn()
        .mockResolvedValue(
          left(new CommunityProposalNotFoundError(proposalId)),
        );

      await expect(controller.rejectProposal(proposalId)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockCommunityProposalsPort.reject).toHaveBeenCalledWith(
        proposalId,
      );
    });

    it('should throw BadRequestException for other rejection errors', async () => {
      const proposalId = UniqueEntityID.create().toString();

      mockCommunityProposalsPort.reject.mockResolvedValue(
        left(new InvalidProposalStateError()),
      );

      await expect(controller.rejectProposal(proposalId)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockCommunityProposalsPort.reject).toHaveBeenCalledWith(
        proposalId,
      );
    });
  });
});
