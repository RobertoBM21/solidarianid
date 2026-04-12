import { left, right, UniqueEntityID } from '@app/shared/domain';
import { DomainEventsPort } from '@app/shared/domain/ports/domain-events.port';
import { Test, TestingModule } from '@nestjs/testing';
import { UserIsNotAdminError } from '../../../communities/domain/community.aggregate';
import { CauseAggr } from '../../domain/aggregates/cause.aggregate';
import { CommunityAuthorizationPort } from '../../domain/ports/community-authz.port';
import {
  CauseAggrRepository,
  CauseNotFoundError,
} from '../../domain/repositories/cause-aggr.repository';
import { InitiativeAlreadyClosedError } from '../../domain/value-objects/initiative-status.vo';
import { ActionsService } from './actions.service';

describe('ActionsService', () => {
  let service: ActionsService;

  const mockDomainEvents: jest.Mocked<Pick<DomainEventsPort, 'dispatch'>> = {
    dispatch: jest.fn(),
  };

  const mockCauseRepository: jest.Mocked<
    Pick<CauseAggrRepository, 'findById'>
  > = {
    findById: jest.fn(),
  };

  const mockCommunityAuthzPort: jest.Mocked<CommunityAuthorizationPort> = {
    canManageCommunity: jest.fn(),
  };

  const communityId = UniqueEntityID.create();
  const causeId = UniqueEntityID.create();
  const requesterId = UniqueEntityID.create();

  const makeCauseAggr = (closed = false) =>
    CauseAggr.create({
      id: causeId.toString(),
      title: 'Test Cause',
      communityId: communityId.toString(),
      closed,
    }).value as CauseAggr;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionsService,
        {
          provide: CauseAggrRepository,
          useValue: mockCauseRepository,
        },
        {
          provide: CommunityAuthorizationPort,
          useValue: mockCommunityAuthzPort,
        },
        {
          provide: DomainEventsPort,
          useValue: mockDomainEvents,
        },
      ],
    }).compile();

    service = module.get<ActionsService>(ActionsService);
    jest.clearAllMocks();
  });

  it('should create a funding action when requester is admin', async () => {
    const cause = makeCauseAggr();

    mockCauseRepository.findById.mockResolvedValue(right(cause));
    mockCommunityAuthzPort.canManageCommunity.mockResolvedValue(true);
    mockDomainEvents.dispatch.mockResolvedValue(undefined);

    const result = await service.createFundingAction(causeId, requesterId, {
      title: 'Buy supplies',
      description: 'Buy supplies for the cause',
      objectives: ['Goal 1'],
      targetAmount: 100,
    });

    expect(result.isRight()).toBe(true);
    expect(mockCauseRepository.findById).toHaveBeenCalledWith(causeId);
    expect(mockCommunityAuthzPort.canManageCommunity).toHaveBeenCalledWith(
      requesterId.toString(),
      communityId.toString(),
    );
    expect(mockDomainEvents.dispatch).toHaveBeenCalledWith(cause);
  });

  it('should fail when cause does not exist', async () => {
    mockCauseRepository.findById.mockResolvedValue(
      left(new CauseNotFoundError(causeId.toString())),
    );

    const result = await service.createFundingAction(causeId, requesterId, {
      title: 'Buy supplies',
      description: 'Buy supplies for the cause',
      targetAmount: 100,
      objectives: [],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(CauseNotFoundError);
    expect(mockCauseRepository.findById).toHaveBeenCalledWith(causeId);
    expect(mockCommunityAuthzPort.canManageCommunity).not.toHaveBeenCalled();
  });

  it('should fail when cause is closed', async () => {
    const cause = makeCauseAggr(true);

    mockCauseRepository.findById.mockResolvedValue(right(cause));
    mockCommunityAuthzPort.canManageCommunity.mockResolvedValue(true);

    const result = await service.createFundingAction(causeId, requesterId, {
      title: 'Buy supplies',
      description: 'Buy supplies for the cause',
      targetAmount: 100,
      objectives: [],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InitiativeAlreadyClosedError);
    expect(mockCauseRepository.findById).toHaveBeenCalledWith(causeId);
    expect(mockCommunityAuthzPort.canManageCommunity).toHaveBeenCalled();
  });

  it('should fail when requester is not admin', async () => {
    const cause = makeCauseAggr();

    mockCommunityAuthzPort.canManageCommunity.mockResolvedValue(false);
    mockCauseRepository.findById.mockResolvedValue(right(cause));

    const result = await service.createFundingAction(causeId, requesterId, {
      title: 'Buy supplies',
      description: 'Buy supplies for the cause',
      targetAmount: 100,
      objectives: [],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserIsNotAdminError);
    expect(mockCauseRepository.findById).toHaveBeenCalledWith(causeId);
    expect(mockCommunityAuthzPort.canManageCommunity).toHaveBeenCalledWith(
      requesterId.toString(),
      communityId.toString(),
    );
  });
});
