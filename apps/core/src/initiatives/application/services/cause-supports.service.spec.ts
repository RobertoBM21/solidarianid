import { left, right, UniqueEntityID } from '@app/shared/domain';
import { DomainEventsPort } from '@app/shared/domain/ports/domain-events.port';
import { Test, TestingModule } from '@nestjs/testing';
import { UserNotFoundError } from '../../../identity/domain/repositories/user.repository';
import { CauseAggr } from '../../domain/aggregates/cause.aggregate';
import {
  AnonymousSupporterError,
  AnonymousSupporterRepository,
} from '../../domain/repositories/anonymous-supporter.repository';
import {
  CauseAggrRepository,
  CauseNotFoundError,
} from '../../domain/repositories/cause-aggr.repository';
import {
  CauseSupportNotFoundError,
  CauseSupportRepository,
} from '../../domain/repositories/cause-support.repository';
import { UserSupporter } from '../../domain/value-objects/supporter.vo';
import { AlreadySupportingError } from '../ports/cause-supports.port';
import { GetUserPort } from '../ports/get-user.port';
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

  const mockGetUserPort: jest.Mocked<Pick<GetUserPort, 'getUser'>> = {
    getUser: jest.fn(),
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

  const makeUserProfileDto = (userId: string) => ({
    id: userId,
    name: 'Test User',
    email: 'test@user.com',
  });

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
          provide: GetUserPort,
          useValue: mockGetUserPort,
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
      mockGetUserPort.getUser.mockResolvedValue(makeUserProfileDto(userId));
      mockCauseSupportRepository.existsForSupporterAndCause.mockResolvedValue(
        false,
      );
      mockDomainEvents.dispatch.mockResolvedValue(undefined);

      const result = await service.registerSupportForUser({
        causeId,
        userId,
      });

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual(
        expect.objectContaining({
          supporterId: expect.any(String),
          supporterName: 'Test User',
          createdAt: expect.any(Date),
        }),
      );
      expect(mockGetUserPort.getUser).toHaveBeenCalledWith(userId);
      expect(mockCauseRepository.findById).toHaveBeenCalledWith(
        UniqueEntityID.create(causeId),
      );
      expect(
        mockCauseSupportRepository.existsForSupporterAndCause,
      ).toHaveBeenCalledWith(
        UserSupporter.create(UniqueEntityID.create(userId)),
        UniqueEntityID.create(causeId),
      );
      expect(mockDomainEvents.dispatch).toHaveBeenCalledWith(cause);
    });

    it('should return error when cause not found for user', async () => {
      mockCauseRepository.findById.mockResolvedValue(
        left(new CauseNotFoundError(UniqueEntityID.create(causeId).toString())),
      );

      const result = await service.registerSupportForUser({ causeId, userId });

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(CauseNotFoundError);
      expect(mockGetUserPort.getUser).toHaveBeenCalledWith(userId);
      expect(mockCauseRepository.findById).toHaveBeenCalledWith(
        UniqueEntityID.create(causeId),
      );
      expect(
        mockCauseSupportRepository.existsForSupporterAndCause,
      ).not.toHaveBeenCalled();
    });

    it('should return error when user does not exist', async () => {
      const cause = makeCauseAggr();

      mockGetUserPort.getUser.mockResolvedValue(null);
      mockCauseRepository.findById.mockResolvedValue(right(cause));

      const result = await service.registerSupportForUser({ causeId, userId });

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(UserNotFoundError);
      expect(mockGetUserPort.getUser).toHaveBeenCalledWith(userId);
      expect(mockCauseRepository.findById).not.toHaveBeenCalled();
    });

    it('should return error when already supporting (user)', async () => {
      const cause = makeCauseAggr();

      mockCauseRepository.findById.mockResolvedValue(right(cause));
      mockGetUserPort.getUser.mockResolvedValue(makeUserProfileDto(userId));
      mockCauseSupportRepository.existsForSupporterAndCause.mockResolvedValue(
        true,
      );

      const result = await service.registerSupportForUser({ causeId, userId });

      expect(result.isLeft()).toBe(true);
      expect(mockCauseRepository.findById).toHaveBeenCalledWith(
        UniqueEntityID.create(causeId),
      );
      expect(mockGetUserPort.getUser).toHaveBeenCalledWith(userId);
      expect(
        mockCauseSupportRepository.existsForSupporterAndCause,
      ).toHaveBeenCalledWith(
        UserSupporter.create(UniqueEntityID.create(userId)),
        UniqueEntityID.create(causeId),
      );
    });
  });

  describe('registerSupportForAnonymous', () => {
    it('should register support for an anonymous supporter', async () => {
      const cause = makeCauseAggr();
      const anonName = 'Anon';
      const anonEmail = 'anon@email.com';

      mockCauseRepository.findById.mockResolvedValue(right(cause));
      mockAnonymousSupporters.getOrCreate.mockResolvedValue(
        right(UniqueEntityID.create()),
      );
      mockCauseSupportRepository.existsForSupporterAndCause.mockResolvedValue(
        false,
      );
      mockDomainEvents.dispatch.mockResolvedValue(undefined);

      const result = await service.registerSupportForAnonymous(causeId, {
        name: anonName,
        email: anonEmail,
      });

      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual(
        expect.objectContaining({
          supporterId: expect.any(String),
          supporterName: anonName,
          createdAt: expect.any(Date),
        }),
      );
      expect(mockCauseRepository.findById).toHaveBeenCalledWith(
        UniqueEntityID.create(causeId),
      );
      expect(mockAnonymousSupporters.getOrCreate).toHaveBeenCalledWith(
        anonName,
        anonEmail,
      );
      expect(
        mockCauseSupportRepository.existsForSupporterAndCause,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(UniqueEntityID),
        }),
        UniqueEntityID.create(causeId),
      );
      expect(mockDomainEvents.dispatch).toHaveBeenCalledWith(cause);
    });

    it('should return error when anonymous supporter creation fails', async () => {
      const cause = makeCauseAggr();
      const anonName = 'Anon';
      const anonEmail = 'anon@email.com';

      mockCauseRepository.findById.mockResolvedValue(right(cause));
      mockAnonymousSupporters.getOrCreate.mockResolvedValue(
        left(new AnonymousSupporterError()),
      );

      const result = await service.registerSupportForAnonymous(causeId, {
        name: anonName,
        email: anonEmail,
      });

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(AnonymousSupporterError);
    });

    it('should return error when already supporting (anonymous)', async () => {
      const cause = makeCauseAggr();
      const anonName = 'Anon';
      const anonEmail = 'anon@email.com';

      mockCauseRepository.findById.mockResolvedValue(right(cause));
      mockAnonymousSupporters.getOrCreate.mockResolvedValue(
        right(UniqueEntityID.create()),
      );
      mockCauseSupportRepository.existsForSupporterAndCause.mockResolvedValue(
        true,
      );

      const result = await service.registerSupportForAnonymous(causeId, {
        name: anonName,
        email: anonEmail,
      });

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(AlreadySupportingError);
      expect(mockCauseRepository.findById).toHaveBeenCalledWith(
        UniqueEntityID.create(causeId),
      );
      expect(mockAnonymousSupporters.getOrCreate).toHaveBeenCalledWith(
        anonName,
        anonEmail,
      );
      expect(
        mockCauseSupportRepository.existsForSupporterAndCause,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(UniqueEntityID),
        }),
        UniqueEntityID.create(causeId),
      );
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
      expect(result.value).toBeInstanceOf(CauseSupportNotFoundError);
      expect(
        mockCauseSupportRepository.removeByUserAndCause,
      ).toHaveBeenCalledTimes(1);
    });
  });
});
