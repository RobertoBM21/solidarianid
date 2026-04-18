import { left, right, UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { CauseAggr } from '../../domain/aggregates/cause.aggregate';
import { CommunityAuthorizationPort } from '../../domain/ports/community-authz.port';
import { ActionRepository } from '../../domain/repositories/action.repository';
import {
  CauseAggrRepository,
  CauseNotFoundError,
} from '../../domain/repositories/cause-aggr.repository';
import { CauseSupportRepository } from '../../domain/repositories/cause-support.repository';
import { UserSupporter } from '../../domain/value-objects/supporter.vo';
import { CauseDataGetterPort } from '../ports/cause-data-getter.port';
import { CausesService } from './causes.service';

describe('CausesService', () => {
  let service: CausesService;

  const mockCauseRepository: jest.Mocked<
    Pick<CauseAggrRepository, 'findById'>
  > = {
    findById: jest.fn(),
  };

  const mockActionRepository: jest.Mocked<
    Pick<ActionRepository, 'listByCause'>
  > = {
    listByCause: jest.fn(),
  };

  const mockSupportRepository: jest.Mocked<
    Pick<CauseSupportRepository, 'existsForSupporterAndCause'>
  > = {
    existsForSupporterAndCause: jest.fn(),
  };

  const mockCauseDataGetter: jest.Mocked<
    Pick<CauseDataGetterPort, 'getCauseData'>
  > = {
    getCauseData: jest.fn(),
  };

  const mockCommunityAuthzPort: jest.Mocked<
    Pick<CommunityAuthorizationPort, 'canManageCommunity'>
  > = {
    canManageCommunity: jest.fn(),
  };

  const communityId = UniqueEntityID.create();
  const causeId = UniqueEntityID.create();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CausesService,
        {
          provide: CauseAggrRepository,
          useValue: mockCauseRepository,
        },
        {
          provide: ActionRepository,
          useValue: mockActionRepository,
        },
        {
          provide: CauseSupportRepository,
          useValue: mockSupportRepository,
        },
        {
          provide: CauseDataGetterPort,
          useValue: mockCauseDataGetter,
        },
        {
          provide: CommunityAuthorizationPort,
          useValue: mockCommunityAuthzPort,
        },
      ],
    }).compile();

    service = module.get<CausesService>(CausesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCause', () => {
    it('should get a cause by id', async () => {
      const cause = CauseAggr.create({
        id: causeId.toString(),
        title: 'Test Cause',
        communityId: communityId.toString(),
        closed: false,
      }).value as CauseAggr;

      mockCauseRepository.findById.mockResolvedValue(right(cause));
      mockSupportRepository.existsForSupporterAndCause.mockResolvedValue(true);
      mockCommunityAuthzPort.canManageCommunity.mockResolvedValue(true);
      mockActionRepository.listByCause.mockResolvedValue([]);
      mockCauseDataGetter.getCauseData.mockResolvedValue({
        communityName: 'Test Community',
        title: cause.title,
        description: 'Test Description',
        duration: '1 month',
        closed: false,
        createdAt: new Date(),
        ods: 1,
      });

      const result = await service.getCause(
        cause.id.toString(),
        UniqueEntityID.create().toString(),
      );

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.id).toBe(cause.id.toString());
        expect(result.value.communityName).toBe('Test Community');
        expect(result.value.supportedByUser).toBe(true);
        expect(result.value.isCommunityAdmin).toBe(true);
      }

      expect(mockCauseRepository.findById).toHaveBeenCalledWith(causeId);
      expect(
        mockSupportRepository.existsForSupporterAndCause,
      ).toHaveBeenCalledWith(
        expect.any(UserSupporter),
        UniqueEntityID.create(cause.id.toString()),
      );
      expect(mockActionRepository.listByCause).toHaveBeenCalledTimes(1);
      expect(mockCauseDataGetter.getCauseData).toHaveBeenCalledWith(
        cause.communityId.toString(),
        cause.id.toString(),
      );
      expect(mockCommunityAuthzPort.canManageCommunity).toHaveBeenCalledWith(
        expect.any(String),
        cause.communityId.toString(),
      );
    });

    it('should fail when a cause is not found', async () => {
      const missingId = UniqueEntityID.create().toString();

      mockCauseRepository.findById.mockResolvedValue(
        left(new CauseNotFoundError(missingId)),
      );

      const result = await service.getCause(communityId.toString(), missingId);

      expect(result.isLeft()).toBe(true);
    });
  });
});
