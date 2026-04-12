import { left, right, UniqueEntityID } from '@app/shared/domain';
import { DomainEventsPort } from '@app/shared/domain/ports/domain-events.port';
import { Test, TestingModule } from '@nestjs/testing';
import { CauseAggr } from '../../domain/aggregates/cause.aggregate';
import { UserCheckerPort } from '../../domain/ports/user-checker.port';
import { AnonymousSupporterRepository } from '../../domain/repositories/anonymous-supporter.repository';
import {
  CauseAggrRepository,
  CauseNotFoundError,
} from '../../domain/repositories/cause-aggr.repository';
import {
  CauseSupportNotFoundError,
  CauseSupportRepository,
} from '../../domain/repositories/cause-support.repository';
import { CauseSupportsService } from './cause-supports.service';

describe('CauseSupportsService', () => {
  let service: CauseSupportsService;

  const mockCauseRepository: jest.Mocked<
    Pick<CauseAggrRepository, 'findById'>
  > = {
    findById: jest.fn(),
  };

  const mockCauseSupportRepository: jest.Mocked<
    Pick<
      CauseSupportRepository,
      'save' | 'existsForSupporterAndCause' | 'removeByUserAndCause'
    >
  > = {
    save: jest.fn(),
    existsForSupporterAndCause: jest.fn(),
    removeByUserAndCause: jest.fn(),
  };

  const mockAnonymousSupporters: jest.Mocked<
    Pick<AnonymousSupporterRepository, 'getOrCreate'>
  > = {
    getOrCreate: jest.fn(),
  };

  const mockDomainEvents: jest.Mocked<Pick<DomainEventsPort, 'dispatch'>> = {
    dispatch: jest.fn(),
  };

  const mockUserChecker: jest.Mocked<Pick<UserCheckerPort, 'userExists'>> = {
    userExists: jest.fn(),
  };

  const communityId = UniqueEntityID.create().toString();
  const causeId = UniqueEntityID.create().toString();
  const userId = UniqueEntityID.create().toString();

  const makeCauseAggr = (closed = false) =>
    CauseAggr.create({
      id: causeId,
      title: 'Test Cause',
      communityId: communityId,
      closed,
    }).value as CauseAggr;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CauseSupportsService,
        { provide: CauseAggrRepository, useValue: mockCauseRepository },
        {
          provide: CauseSupportRepository,
          useValue: mockCauseSupportRepository,
        },
        {
          provide: AnonymousSupporterRepository,
          useValue: mockAnonymousSupporters,
        },
        {
          provide: DomainEventsPort,
          useValue: mockDomainEvents,
        },
        {
          provide: UserCheckerPort,
          useValue: mockUserChecker,
        },
      ],
    }).compile();

    service = module.get(CauseSupportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerSupportForUser', () => {
    it('should register support for a registered user', async () => {
      const cause = makeCauseAggr();

      mockCauseRepository.findById.mockResolvedValue(right(cause));
      mockUserChecker.userExists.mockResolvedValue(true);
      mockCauseSupportRepository.existsForSupporterAndCause.mockResolvedValue(
        false,
      );
      mockDomainEvents.dispatch.mockResolvedValue(undefined);

      const result = await service.registerSupportForUser({
        causeId,
        userId,
      });

      expect(result.isRight()).toBe(true);
      expect(mockUserChecker.userExists).toHaveBeenCalledWith(
        UniqueEntityID.create(userId),
      );
      expect(mockDomainEvents.dispatch).toHaveBeenCalledWith(cause);
    });

    it('should return error when cause not found for user', async () => {
      mockCauseRepository.findById.mockResolvedValue(
        left(new CauseNotFoundError(UniqueEntityID.create(causeId).toString())),
      );

      const result = await service.registerSupportForUser({ causeId, userId });

      expect(result.isLeft()).toBe(true);
    });

    it('should return error when user does not exist', async () => {
      const cause = makeCauseAggr();

      mockCauseRepository.findById.mockResolvedValue(right(cause));
      mockUserChecker.userExists.mockResolvedValue(false);

      const result = await service.registerSupportForUser({ causeId, userId });

      expect(result.isLeft()).toBe(true);
    });

    it('should return error when already supporting (user)', async () => {
      const cause = makeCauseAggr();

      mockCauseRepository.findById.mockResolvedValue(right(cause));
      mockUserChecker.userExists.mockResolvedValue(true);
      mockCauseSupportRepository.existsForSupporterAndCause.mockResolvedValue(
        true,
      );

      const result = await service.registerSupportForUser({ causeId, userId });

      expect(result.isLeft()).toBe(true);
    });
  });

  describe('registerSupportForAnonymous', () => {
    it('should register support for an anonymous supporter', async () => {
      const cause = makeCauseAggr();

      mockCauseRepository.findById.mockResolvedValue(right(cause));
      mockAnonymousSupporters.getOrCreate.mockResolvedValue(
        right(UniqueEntityID.create()),
      );
      mockCauseSupportRepository.existsForSupporterAndCause.mockResolvedValue(
        false,
      );
      mockDomainEvents.dispatch.mockResolvedValue(undefined);

      const result = await service.registerSupportForAnonymous({
        causeId,
        data: {
          name: 'Anon',
          email: 'anon@email.com',
        },
      });

      expect(result.isRight()).toBe(true);
      expect(mockDomainEvents.dispatch).toHaveBeenCalledWith(cause);
    });

    it('should return error when anonymous supporter creation fails', async () => {
      const cause = makeCauseAggr();

      mockCauseRepository.findById.mockResolvedValue(right(cause));
      mockAnonymousSupporters.getOrCreate.mockResolvedValue(left(new Error()));

      const result = await service.registerSupportForAnonymous({
        causeId,
        data: {
          name: 'Anon',
          email: 'anon@email.com',
        },
      });

      expect(result.isLeft()).toBe(true);
    });

    it('should return error when already supporting (anonymous)', async () => {
      const cause = makeCauseAggr();

      mockCauseRepository.findById.mockResolvedValue(right(cause));
      mockAnonymousSupporters.getOrCreate.mockResolvedValue(
        right(UniqueEntityID.create()),
      );
      mockCauseSupportRepository.existsForSupporterAndCause.mockResolvedValue(
        true,
      );

      const result = await service.registerSupportForAnonymous({
        causeId,
        data: {
          name: 'Anon',
          email: 'anon@email.com',
        },
      });

      expect(result.isLeft()).toBe(true);
    });
  });

  describe('cancelSupport', () => {
    it('should cancel support for user', async () => {
      const cause = makeCauseAggr();

      mockCauseRepository.findById.mockResolvedValue(right(cause));
      mockCauseSupportRepository.removeByUserAndCause.mockResolvedValue(
        right(undefined),
      );

      const result = await service.cancelSupport(causeId, userId);

      expect(result.isRight()).toBe(true);
      expect(
        mockCauseSupportRepository.removeByUserAndCause,
      ).toHaveBeenCalledTimes(1);
    });

    it('should return error when support not found on cancel', async () => {
      const cause = makeCauseAggr();

      mockCauseRepository.findById.mockResolvedValue(right(cause));
      mockCauseSupportRepository.removeByUserAndCause.mockResolvedValue(
        left(new CauseSupportNotFoundError()),
      );

      const result = await service.cancelSupport(causeId, userId);

      expect(result.isLeft()).toBe(true);
    });
  });
});
