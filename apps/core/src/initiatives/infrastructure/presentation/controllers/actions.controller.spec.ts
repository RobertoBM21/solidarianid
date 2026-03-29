import { left, right, UniqueEntityID } from '@app/shared/domain';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserIsNotAdminError } from '../../../../communities/domain/community.aggregate';
import { CreateFundingActionDto } from '../../../application/dtos/create-funding-action.dto';
import { CreateVolunteeringActionDto } from '../../../application/dtos/create-volunteering-action.dto';
import {
  ActionsPort,
  FundingActionOut,
  VolunteeringActionOut,
} from '../../../application/ports/actions.port';
import { CauseNotFoundError } from '../../../domain/repositories/cause.repository';
import { InitiativeAlreadyClosedError } from '../../../domain/value-objects/initiative-status.vo';
import { ActionsController } from './actions.controller';

describe('ActionsController', () => {
  let controller: ActionsController;

  const mockActionsPort = {
    createFundingAction: jest.fn(),
    createVolunteeringAction: jest.fn(),
  };

  const causeId = UniqueEntityID.create().toString();
  const userId = UniqueEntityID.create().toString();
  const actionId = UniqueEntityID.create().toString();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActionsController],
      providers: [
        {
          provide: ActionsPort,
          useValue: mockActionsPort,
        },
      ],
    }).compile();

    controller = module.get<ActionsController>(ActionsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createFunding', () => {
    const dto: CreateFundingActionDto = {
      title: 'Funding Action',
      description: 'Collect money',
      objectives: ['10k'],
      targetAmount: 10000,
    };

    it('should return created funding action when successful', async () => {
      const expectedOutput: FundingActionOut = {
        id: actionId,
        causeId,
        title: dto.title,
        description: dto.description,
        objectives: dto.objectives,
        closed: false,
        createdAt: new Date().toISOString(),
        type: 'funding',
        targetAmount: dto.targetAmount,
        currentAmount: 0,
      };

      mockActionsPort.createFundingAction.mockResolvedValue(
        right(expectedOutput),
      );

      const result = await controller.createFunding(causeId, dto, userId);

      expect(result).toEqual(expectedOutput);
      expect(mockActionsPort.createFundingAction).toHaveBeenCalledWith({
        causeId,
        requesterId: userId,
        data: dto,
      });
    });

    it('should throw NotFoundException when CauseNotFoundError', async () => {
      mockActionsPort.createFundingAction.mockResolvedValue(
        left(new CauseNotFoundError(causeId)),
      );

      await expect(
        controller.createFunding(causeId, dto, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when UserIsNotAdminError', async () => {
      mockActionsPort.createFundingAction.mockResolvedValue(
        left(new UserIsNotAdminError(userId)),
      );

      await expect(
        controller.createFunding(causeId, dto, userId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when InitiativeAlreadyClosedError', async () => {
      mockActionsPort.createFundingAction.mockResolvedValue(
        left(new InitiativeAlreadyClosedError()),
      );

      await expect(
        controller.createFunding(causeId, dto, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on generic error', async () => {
      mockActionsPort.createFundingAction.mockResolvedValue(
        left(new Error('Generic Error')),
      );

      await expect(
        controller.createFunding(causeId, dto, userId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createVolunteering', () => {
    const dto: CreateVolunteeringActionDto = {
      title: 'Volunteering Action',
      description: 'Help people',
      objectives: ['Recruit 10 people'],
      start: new Date().toISOString(),
      end: new Date().toISOString(),
    };

    it('should return created volunteering action when successful', async () => {
      const expectedOutput: VolunteeringActionOut = {
        id: actionId,
        causeId,
        title: dto.title,
        description: dto.description,
        objectives: dto.objectives,
        closed: false,
        createdAt: new Date().toISOString(),
        type: 'volunteering',
        start: dto.start,
        end: dto.end,
      };

      mockActionsPort.createVolunteeringAction.mockResolvedValue(
        right(expectedOutput),
      );

      const result = await controller.createVolunteering(causeId, dto, userId);

      expect(result).toEqual(expectedOutput);
      expect(mockActionsPort.createVolunteeringAction).toHaveBeenCalledWith({
        causeId,
        requesterId: userId,
        data: dto,
      });
    });

    it('should throw NotFoundException when CauseNotFoundError', async () => {
      mockActionsPort.createVolunteeringAction.mockResolvedValue(
        left(new CauseNotFoundError(causeId)),
      );

      await expect(
        controller.createVolunteering(causeId, dto, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when UserIsNotAdminError', async () => {
      mockActionsPort.createVolunteeringAction.mockResolvedValue(
        left(new UserIsNotAdminError(userId)),
      );

      await expect(
        controller.createVolunteering(causeId, dto, userId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when InitiativeAlreadyClosedError', async () => {
      mockActionsPort.createVolunteeringAction.mockResolvedValue(
        left(new InitiativeAlreadyClosedError()),
      );

      await expect(
        controller.createVolunteering(causeId, dto, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on generic error', async () => {
      mockActionsPort.createVolunteeringAction.mockResolvedValue(
        left(new Error('Generic Error')),
      );

      await expect(
        controller.createVolunteering(causeId, dto, userId),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
