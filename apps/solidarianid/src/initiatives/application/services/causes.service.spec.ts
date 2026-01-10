import { left, right, UniqueEntityID } from '@app/shared/domain';
import { DomainEventsPort } from '@app/shared/domain/ports/domain-events.port';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { IsCommunityAdminQuery } from '../../../communities/application/queries/is-community-admin.query';
import { UserIsNotAdminError } from '../../../communities/domain/community.aggregate';
import { Cause } from '../../domain/aggregates/cause.aggregate';
import { ActionRepository } from '../../domain/repositories/action.repository';
import {
  CauseNotFoundError,
  CauseRepository,
} from '../../domain/repositories/cause.repository';
import { IsCauseSupportedByUserQuery } from '../queries/is-cause-supported-by-user.query';
import { CausesService } from './causes.service';

describe('CausesService', () => {
  let service: CausesService;

  const mockCauseRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    findByIdAndCommunity: jest.fn(),
    listByCommunity: jest.fn(),
    remove: jest.fn(),
  };

  const mockDomainEvents: DomainEventsPort = {
    dispatch: jest.fn(),
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
  const otherCommunityId = UniqueEntityID.create().toString();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CausesService,
        {
          provide: CauseRepository,
          useValue: mockCauseRepository,
        },
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
        {
          provide: DomainEventsPort,
          useValue: mockDomainEvents,
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

  describe('createCause', () => {
    it('should create a cause when user is admin', async () => {
      mockCauseRepository.save.mockResolvedValue(undefined);
      mockQueryBus.execute.mockResolvedValue(true);

      const userId = UniqueEntityID.create().toString();

      const result = await service.createCause(
        communityId,
        {
          title: 'Causa demo',
          description: 'Descripcion',
          duration: '3 meses',
          ods: 2,
        },
        userId,
      );

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.title).toBe('Causa demo');
      }
      expect(mockCauseRepository.save).toHaveBeenCalledTimes(1);
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(IsCommunityAdminQuery),
      );
    });

    it('should fail when user is not admin or community is not found', async () => {
      mockQueryBus.execute.mockResolvedValue(false);

      const userId = UniqueEntityID.create().toString();

      const result = await service.createCause(
        communityId,
        {
          title: 'Causa demo',
          description: 'Descripcion',
          duration: '3 meses',
          ods: 2,
        },
        userId,
      );

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(UserIsNotAdminError);
      }
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(IsCommunityAdminQuery),
      );
      expect(mockCauseRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('listByCommunity', () => {
    it('should list causes by community', async () => {
      const cause = Cause.create({
        title: 'Causa demo',
        description: 'Descripcion',
        duration: '3 meses',
        ods: 2,
        communityId,
      }).value as Cause;

      mockQueryBus.execute.mockResolvedValue(true);
      mockCauseRepository.listByCommunity.mockResolvedValue([cause]);

      const result = await service.listByCommunity(communityId);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0].id).toBe(cause.id.toString());
      }
    });
  });

  describe('closeCause', () => {
    it('should close a cause', async () => {
      const cause = Cause.create({
        title: 'Causa demo',
        description: 'Descripcion',
        duration: '3 meses',
        ods: 2,
        communityId,
      }).value as Cause;
      const userId = UniqueEntityID.create().toString();

      const closeFn = jest
        .spyOn(cause, 'close')
        .mockReturnValue(right(undefined));

      mockQueryBus.execute.mockResolvedValue(true);
      mockCauseRepository.findById.mockResolvedValue(right(cause));
      mockCauseRepository.findByIdAndCommunity.mockResolvedValue(right(cause));
      mockCauseRepository.save.mockResolvedValue(undefined);

      const result = await service.closeCause(
        communityId,
        cause.id.toString(),
        userId,
      );

      expect(result.isRight()).toBe(true);
      expect(closeFn).toHaveBeenCalledTimes(1);
      expect(mockCauseRepository.save).toHaveBeenCalledTimes(1);
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(IsCommunityAdminQuery),
      );
    });

    it('should fail closing a cause when not found', async () => {
      const cause = Cause.create({
        title: 'Causa demo',
        description: 'Descripcion',
        duration: '3 meses',
        ods: 2,
        communityId: otherCommunityId,
      }).value as Cause;
      const userId = UniqueEntityID.create().toString();

      mockQueryBus.execute.mockResolvedValue(true);
      mockCauseRepository.findByIdAndCommunity.mockResolvedValue(
        left(new CauseNotFoundError(cause.id.toString())),
      );

      const result = await service.closeCause(
        communityId,
        cause.id.toString(),
        userId,
      );

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(CauseNotFoundError);
      }
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(IsCommunityAdminQuery),
      );
      expect(mockCauseRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getCause', () => {
    it('should get a cause by id', async () => {
      const cause = Cause.create({
        title: 'Causa demo',
        description: 'Descripcion',
        duration: '3 meses',
        ods: 2,
        communityId,
      }).value as Cause;

      mockCauseRepository.findByIdAndCommunity.mockResolvedValue(right(cause));
      mockQueryBus.execute.mockResolvedValue(true);
      mockActionRepository.listByCause.mockResolvedValue([]);

      const result = await service.getCause(
        communityId,
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

      mockCauseRepository.findByIdAndCommunity.mockResolvedValue(
        left(new CauseNotFoundError(missingId)),
      );

      const result = await service.getCause(communityId, missingId);

      expect(result.isLeft()).toBe(true);
    });
  });
});
