import { left, right, UniqueEntityID } from '@app/shared/domain';
import { DomainEventsPort } from '@app/shared/domain/ports/domain-events.port';
import { Test, TestingModule } from '@nestjs/testing';
import { Cause } from '../../domain/aggregates/cause.aggregate';
import { Community } from '../../domain/aggregates/community.aggregate';
import {
  CauseNotFoundError,
  CausesRepository,
} from '../../domain/repositories/causes.repository';
import {
  CommunitiesRepository,
  CommunityNotFoundError,
} from '../../domain/repositories/communities.repository';
import { CausesService } from './causes.service';

describe('CausesService', () => {
  let service: CausesService;

  const mockCausesRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    findByIdAndCommunity: jest.fn(),
    listByCommunity: jest.fn(),
    remove: jest.fn(),
  };

  const mockCommunitiesRepository = {
    findById: jest.fn(),
    exists: jest.fn(),
  };

  const mockDomainEvents: DomainEventsPort = {
    dispatch: jest.fn(),
  };

  const communityId = UniqueEntityID.create().toString();
  const otherCommunityId = UniqueEntityID.create().toString();
  const baseCommunity = Community.create({
    name: 'Comunidad de prueba',
    description: 'Descripcion',
    admins: [],
    causes: [],
    createdAt: new Date(),
  }).value as Community;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CausesService,
        {
          provide: CausesRepository,
          useValue: mockCausesRepository,
        },
        {
          provide: CommunitiesRepository,
          useValue: mockCommunitiesRepository,
        },
        {
          provide: DomainEventsPort,
          useValue: mockDomainEvents,
        },
      ],
    }).compile();

    service = module.get<CausesService>(CausesService);
    jest.clearAllMocks();
    mockCommunitiesRepository.exists.mockResolvedValue(true);
  });

  describe('createCause', () => {
    it('should create a cause when community exists', async () => {
      mockCommunitiesRepository.findById.mockResolvedValue(
        right(baseCommunity),
      );
      mockCausesRepository.save.mockResolvedValue(undefined);

      const result = await service.createCause(communityId, {
        title: 'Causa demo',
        description: 'Descripcion',
        duration: '3 meses',
        ods: 2,
      });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.title).toBe('Causa demo');
        expect(mockCausesRepository.save).toHaveBeenCalledTimes(1);
      }
    });

    it('should fail when community is not found', async () => {
      mockCommunitiesRepository.exists.mockResolvedValue(false);

      const result = await service.createCause(communityId, {
        title: 'Causa demo',
        description: 'Descripcion',
        duration: '3 meses',
        ods: 2,
      });

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(CommunityNotFoundError);
      }
      expect(mockCausesRepository.save).not.toHaveBeenCalled();
    });
  });

  it('should list causes by community', async () => {
    const cause = Cause.create({
      title: 'Causa demo',
      description: 'Descripcion',
      duration: '3 meses',
      ods: 2,
      communityId,
    }).value as Cause;

    mockCommunitiesRepository.findById.mockResolvedValue(right(baseCommunity));
    mockCausesRepository.listByCommunity.mockResolvedValue([cause]);

    const result = await service.listByCommunity(communityId);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0].id).toBe(cause.id.toString());
    }
  });

  it('should close a cause', async () => {
    const cause = Cause.create({
      title: 'Causa demo',
      description: 'Descripcion',
      duration: '3 meses',
      ods: 2,
      communityId,
    }).value as Cause;

    const closeFn = jest
      .spyOn(cause, 'close')
      .mockReturnValue(right(undefined));

    mockCausesRepository.findById.mockResolvedValue(right(cause));
    mockCausesRepository.findByIdAndCommunity.mockResolvedValue(right(cause));
    mockCausesRepository.save.mockResolvedValue(undefined);

    const result = await service.closeCause(communityId, cause.id.toString());

    expect(result.isRight()).toBe(true);
    expect(closeFn).toHaveBeenCalledTimes(1);
    expect(mockCausesRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should fail closing a cause when not found', async () => {
    const cause = Cause.create({
      title: 'Causa demo',
      description: 'Descripcion',
      duration: '3 meses',
      ods: 2,
      communityId: otherCommunityId,
    }).value as Cause;

    mockCausesRepository.findByIdAndCommunity.mockResolvedValue(
      left(new CauseNotFoundError(cause.id.toString())),
    );

    const result = await service.closeCause(communityId, cause.id.toString());

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(CauseNotFoundError);
    }
    expect(mockCausesRepository.save).not.toHaveBeenCalled();
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

      mockCausesRepository.findByIdAndCommunity.mockResolvedValue(right(cause));

      const result = await service.getCause(communityId, cause.id.toString());

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.id).toBe(cause.id.toString());
      }
    });

    it('should fail when a cause is not found', async () => {
      const missingId = UniqueEntityID.create().toString();
      mockCausesRepository.findByIdAndCommunity.mockResolvedValue(
        left(new CauseNotFoundError(missingId)),
      );

      const result = await service.getCause(communityId, missingId);

      expect(result.isLeft()).toBe(true);
    });
  });
});
