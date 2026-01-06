import { left, right, UniqueEntityID } from '@app/shared/domain';
import {
  CommunityProposal,
  InvalidProposalStateError,
} from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { CommunityProposalCreated } from '@app/shared/domain/events/community-proposal-created.event';
import { InvalidCommunityNameError } from '@app/shared/domain/value-objects/community-name.vo';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CommunityProposalsPort } from '../../../domain/ports/community-proposals.port';
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

  describe('handleNewProposal', () => {
    it('should handle new proposal event successfully', async () => {
      const event: CommunityProposalCreated = {
        proposalId: UniqueEntityID.create().toString(),
        name: 'New Community',
        description: 'New Description',
        requesterId: UniqueEntityID.create().toString(),
        occurredOn: new Date(),
      };

      mockCommunityProposalsPort.handleNewProposal.mockResolvedValue(
        right(undefined),
      );

      await controller.handleNewProposal(event);

      expect(mockCommunityProposalsPort.handleNewProposal).toHaveBeenCalledWith(
        event,
      );
    });

    it('should throw an error if handling new proposal fails', async () => {
      const event: CommunityProposalCreated = {
        proposalId: UniqueEntityID.create().toString(),
        name: 'New Community',
        description: 'New Description',
        requesterId: UniqueEntityID.create().toString(),
        occurredOn: new Date(),
      };

      const errorMessage = 'Invalid community name';
      mockCommunityProposalsPort.handleNewProposal.mockResolvedValueOnce(
        left(new InvalidCommunityNameError(errorMessage)),
      );

      await expect(controller.handleNewProposal(event)).rejects.toThrow(
        `Error handling new community proposal: ${errorMessage}`,
      );

      expect(mockCommunityProposalsPort.handleNewProposal).toHaveBeenCalledWith(
        event,
      );
    });
  });

  describe('approveProposal', () => {
    it('should approve proposal successfully', async () => {
      const proposalId = UniqueEntityID.create();

      mockCommunityProposalsPort.approve = jest
        .fn()
        .mockResolvedValue(right(proposal1.value));

      await controller.approveProposal(proposalId.toString());

      expect(mockCommunityProposalsPort.approve).toHaveBeenCalledWith(
        proposalId,
      );
    });

    it('should throw NotFoundException if proposal not found during approval', async () => {
      const proposalId = UniqueEntityID.create();

      mockCommunityProposalsPort.approve.mockResolvedValue(
        left(new CommunityProposalNotFoundError(proposalId.toString())),
      );

      await expect(
        controller.approveProposal(proposalId.toString()),
      ).rejects.toThrow(NotFoundException);

      expect(mockCommunityProposalsPort.approve).toHaveBeenCalledWith(
        proposalId,
      );
    });

    it('should throw BadRequestException for other approval errors', async () => {
      const proposalId = UniqueEntityID.create();

      mockCommunityProposalsPort.approve.mockResolvedValue(
        left(new InvalidProposalStateError()),
      );

      await expect(
        controller.approveProposal(proposalId.toString()),
      ).rejects.toThrow(BadRequestException);

      expect(mockCommunityProposalsPort.approve).toHaveBeenCalledWith(
        proposalId,
      );
    });
  });

  describe('rejectProposal', () => {
    it('should reject proposal successfully', async () => {
      const proposalId = UniqueEntityID.create();

      mockCommunityProposalsPort.reject = jest
        .fn()
        .mockResolvedValue(right(proposal2.value));

      await controller.rejectProposal(proposalId.toString());

      expect(mockCommunityProposalsPort.reject).toHaveBeenCalledWith(
        proposalId,
      );
    });

    it('should throw NotFoundException if proposal not found during rejection', async () => {
      const proposalId = UniqueEntityID.create();

      mockCommunityProposalsPort.reject = jest
        .fn()
        .mockResolvedValue(
          left(new CommunityProposalNotFoundError(proposalId.toString())),
        );

      await expect(
        controller.rejectProposal(proposalId.toString()),
      ).rejects.toThrow(NotFoundException);

      expect(mockCommunityProposalsPort.reject).toHaveBeenCalledWith(
        proposalId,
      );
    });

    it('should throw BadRequestException for other rejection errors', async () => {
      const proposalId = UniqueEntityID.create();

      mockCommunityProposalsPort.reject.mockResolvedValue(
        left(new InvalidProposalStateError()),
      );

      await expect(
        controller.rejectProposal(proposalId.toString()),
      ).rejects.toThrow(BadRequestException);

      expect(mockCommunityProposalsPort.reject).toHaveBeenCalledWith(
        proposalId,
      );
    });
  });
});
