import { left, right, UniqueEntityID } from '@app/shared/domain';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { UserIsNotAdminError } from '../../../communities/domain/community.aggregate';
import { Cause } from '../../domain/aggregates/cause.aggregate';
import { ActionRepository } from '../../domain/repositories/action.repository';
import {
  CauseNotFoundError,
  CauseRepository,
} from '../../domain/repositories/cause.repository';
import { InitiativeAlreadyClosedError } from '../../domain/value-objects/initiative-status.vo';
import { ActionsService } from './actions.service';

describe('ActionsService', () => {
  let service: ActionsService;

  const mockActionRepository = {
    save: jest.fn(),
  };

  const mockCauseRepository = {
    findById: jest.fn(),
  };

  const mockQueryBus = {
    execute: jest.fn(),
  };

  const communityId = UniqueEntityID.create().toString();
  const causeId = UniqueEntityID.create().toString();
  const requesterId = UniqueEntityID.create().toString();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionsService,
        {
          provide: ActionRepository,
          useValue: mockActionRepository,
        },
        {
          provide: CauseRepository,
          useValue: mockCauseRepository,
        },
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
      ],
    }).compile();

    service = module.get<ActionsService>(ActionsService);
    jest.clearAllMocks();
  });

  it('Should create a funding action when requester is admin', async () => {
    const cause = Cause.create({
      title: 'Causa demo',
      description: 'Descripcion',
      duration: '3 meses',
      ods: 2,
      communityId,
    }).value as Cause;

    mockQueryBus.execute.mockResolvedValue(true);
    mockCauseRepository.findById.mockResolvedValue(right(cause));
    mockActionRepository.save.mockResolvedValue(undefined);

    const result = await service.createFundingAction({
      causeId,
      requesterId,
      data: {
        title: 'Buy supplies',
        description: 'Buy supplies for the cause',
        objectives: ['Goal 1'],
        targetAmount: 100,
      },
    });

    expect(result.isRight()).toBe(true);
    expect(mockActionRepository.save).toHaveBeenCalledTimes(1);
  });

  it('Should fail when community does not exist', async () => {
    mockCauseRepository.findById.mockResolvedValue(
      left(new CauseNotFoundError(causeId)),
    );

    const result = await service.createFundingAction({
      causeId,
      requesterId,
      data: {
        title: 'Buy supplies',
        description: 'Buy supplies for the cause',
        targetAmount: 100,
        objectives: [],
      },
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(CauseNotFoundError);
    }
  });

  it('Should fail when cause does not exist', async () => {
    mockCauseRepository.findById.mockResolvedValue(
      left(new CauseNotFoundError(causeId)),
    );

    const result = await service.createFundingAction({
      causeId,
      requesterId,
      data: {
        title: 'Buy supplies',
        description: 'Buy supplies for the cause',
        targetAmount: 100,
        objectives: [],
      },
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(CauseNotFoundError);
    }
  });

  it('Should fail when cause is closed', async () => {
    const cause = Cause.create({
      title: 'Causa demo',
      description: 'Descripcion',
      duration: '3 meses',
      ods: 2,
      closed: true,
      communityId,
    }).value as Cause;

    mockCauseRepository.findById.mockResolvedValue(right(cause));

    const result = await service.createFundingAction({
      causeId,
      requesterId,
      data: {
        title: 'Buy supplies',
        description: 'Buy supplies for the cause',
        targetAmount: 100,
        objectives: [],
      },
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InitiativeAlreadyClosedError);
    }
  });

  it('Should fail when requester is not admin', async () => {
    const cause = Cause.create({
      title: 'Causa demo',
      description: 'Descripcion',
      duration: '3 meses',
      ods: 2,
      communityId,
    }).value as Cause;

    mockCauseRepository.findById.mockResolvedValue(right(cause));
    mockQueryBus.execute.mockResolvedValue(false);

    const result = await service.createFundingAction({
      causeId,
      requesterId,
      data: {
        title: 'Buy supplies',
        description: 'Buy supplies for the cause',
        targetAmount: 100,
        objectives: [],
      },
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(UserIsNotAdminError);
    }
  });
});
