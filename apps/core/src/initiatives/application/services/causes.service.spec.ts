import { left, right, UniqueEntityID } from '@app/shared/domain';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { CauseAggr } from '../../domain/aggregates/cause.aggregate';
import { ActionRepository } from '../../domain/repositories/action.repository';
import {
  CauseAggrRepository,
  CauseNotFoundError,
} from '../../domain/repositories/cause-aggr.repository';
import { IsCauseSupportedByUserQuery } from '../queries/is-cause-supported-by-user.query';
import { CausesService } from './causes.service';

describe('CausesService', () => {
  let service: CausesService;

  const mockCauseRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    findByIdAndCommunity: jest.fn(),
    remove: jest.fn(),
  };

  const mockActionRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    remove: jest.fn(),
    listByCause: jest.fn(),
  };

  const mockQueryBus = {
    execute: jest.fn(),
  };

  const communityId = UniqueEntityID.create().toString();
  const causeId = UniqueEntityID.create().toString();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CausesService,
        {
          provide: CauseAggrRepository,
          useValue: mockCauseRepository,
        },
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
        {
          provide: ActionRepository,
          useValue: mockActionRepository,
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
        id: causeId,
        communityId,
        closed: false,
      });

      mockCauseRepository.findById.mockResolvedValue(right(cause));
      mockQueryBus.execute.mockResolvedValue(true);
      mockActionRepository.listByCause.mockResolvedValue([]);

      const result = await service.getCause(
        cause.id.toString(),
        UniqueEntityID.create().toString(),
      );

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.id).toBe(cause.id.toString());
      }
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(IsCauseSupportedByUserQuery),
      );
      expect(mockActionRepository.listByCause).toHaveBeenCalledTimes(1);
    });

    it('should fail when a cause is not found', async () => {
      const missingId = UniqueEntityID.create().toString();

      mockCauseRepository.findById.mockResolvedValue(
        left(new CauseNotFoundError(missingId)),
      );

      const result = await service.getCause(communityId, missingId);

      expect(result.isLeft()).toBe(true);
    });
  });
});
