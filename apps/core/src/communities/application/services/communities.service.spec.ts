import {
  DomainEventsPort,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import { InvalidCommunityNameError } from '@app/shared/domain/value-objects/community-name.vo';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Community,
  CommunityNameAlreadyExistsError,
  UserIsNotAdminError,
} from '../../domain/community.aggregate';
import { Cause } from '../../domain/entities/cause.entity';
import { CauseClosedEvent } from '../../domain/events/cause-closed.event';
import {
  CommunityNotFoundError,
  CommunityRepository,
} from '../../domain/repositories/community.repository';
import { CommunitiesService } from './communities.service';

describe('CommunitiesService', () => {
  let service: CommunitiesService;

  const mockDomainEvents = {
    dispatch: jest.fn(),
  };

  const mockCommunityRepository = {
    existsByName: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    isAdmin: jest.fn(),
    save: jest.fn(),
  };

  const admin1 = UniqueEntityID.create();
  const community1 = Community.create({
    name: 'Community 1',
    description: 'Description 1',
    admins: [admin1.toString()],
    causes: [],
  }).value as Community;
  const community2 = Community.create({
    name: 'Community 2',
    description: 'Description 2',
    admins: [UniqueEntityID.create().toString()],
    causes: [],
  }).value as Community;

  const mockCommunities = [community1, community2];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunitiesService,
        {
          provide: CommunityRepository,
          useValue: mockCommunityRepository,
        },
        {
          provide: DomainEventsPort,
          useValue: mockDomainEvents,
        },
      ],
    }).compile();

    service = module.get<CommunitiesService>(CommunitiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listCommunities', () => {
    it('should return a list of communities', async () => {
      mockCommunityRepository.findAll.mockResolvedValue(mockCommunities);

      const result = await service.listCommunities();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Community 1');
      expect(result[1].name).toBe('Community 2');
      expect(mockCommunityRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCommunity', () => {
    it('should include whether the requester is an admin of the community', async () => {
      mockCommunityRepository.findById.mockResolvedValue(right(community1));

      const result = await service.getCommunity(
        community1.id.toString(),
        admin1.toString(),
      );

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.id).toBe(community1.id.toString());
        expect(result.value.isCommunityAdmin).toBe(true);
      }
    });
  });

  describe('proposeCommunity', () => {
    it('should propose a new community', async () => {
      const proposeData = {
        name: 'New Community',
        description: 'New Description',
      };
      const requesterId = UniqueEntityID.create().toString();

      mockCommunityRepository.existsByName.mockResolvedValue(false);

      const result = await service.proposeCommunity(proposeData, requesterId);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toHaveProperty('proposalId');
      }
      expect(mockDomainEvents.dispatch).toHaveBeenCalledTimes(1);
    });

    it('should reject duplicate community name on proposal', async () => {
      const proposeData = {
        name: 'Community 1',
        description: 'Description 1',
      };
      const requesterId = UniqueEntityID.create().toString();

      mockCommunityRepository.existsByName.mockResolvedValue(true);

      const result = await service.proposeCommunity(proposeData, requesterId);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(CommunityNameAlreadyExistsError);
      }
      expect(mockDomainEvents.dispatch).not.toHaveBeenCalled();
    });

    it('should return an error if proposal creation fails', async () => {
      const proposeData = {
        name: '', // Invalid name to trigger error
        description: 'New Description',
      };
      const requesterId = UniqueEntityID.create().toString();

      mockCommunityRepository.existsByName.mockResolvedValue(false);

      const result = await service.proposeCommunity(proposeData, requesterId);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InvalidCommunityNameError);
      }
      expect(mockDomainEvents.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('createCause', () => {
    const validCauseData = {
      title: 'Demo cause',
      description: 'Description',
      duration: '3 months',
      ods: 2,
    };

    it('should create a cause when user is admin', async () => {
      mockCommunityRepository.findById.mockResolvedValue(right(community1));
      mockCommunityRepository.save.mockResolvedValue(undefined);

      const result = await service.createCause(
        validCauseData,
        community1.id,
        admin1,
      );

      expect(result.isRight()).toBe(true);
      expect(mockCommunityRepository.findById).toHaveBeenCalledWith(
        community1.id,
      );
      expect(mockCommunityRepository.save).toHaveBeenCalledWith(community1);
      expect(community1.causes).toHaveLength(1);
      expect(community1.causes[0].title).toBe(validCauseData.title);
    });

    it('should fail when community not found', async () => {
      const nonExistentCommunityId = UniqueEntityID.create();
      mockCommunityRepository.findById.mockResolvedValue(
        left(new CommunityNotFoundError(nonExistentCommunityId.toString())),
      );

      const result = await service.createCause(
        validCauseData,
        nonExistentCommunityId,
        admin1,
      );

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(CommunityNotFoundError);
      expect(mockCommunityRepository.findById).toHaveBeenCalledWith(
        UniqueEntityID.create(nonExistentCommunityId.toString()),
      );
      expect(mockCommunityRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when user is not admin', async () => {
      const nonAdminId = UniqueEntityID.create();

      mockCommunityRepository.findById.mockResolvedValue(right(community1));

      const result = await service.createCause(
        validCauseData,
        community1.id,
        nonAdminId,
      );

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(UserIsNotAdminError);
      expect(mockCommunityRepository.findById).toHaveBeenCalledWith(
        community1.id,
      );
    });
  });

  describe('closeCause', () => {
    it('should close a cause when user is admin', async () => {
      const causeId = UniqueEntityID.create();
      const community = Community.create({
        name: 'Community with Cause',
        description: 'Description',
        admins: [admin1.toString()],
        causes: [
          Cause.create(
            {
              title: 'Cause to Close',
              description: 'Description',
              duration: '1 month',
              ods: 1,
            },
            causeId.toString(),
          ).value as Cause,
        ],
      }).value as Community;

      mockCommunityRepository.findById.mockResolvedValue(right(community));
      mockCommunityRepository.save.mockResolvedValue(undefined);
      mockDomainEvents.dispatch.mockResolvedValue(undefined);

      const result = await service.closeCause(community.id, causeId, admin1);

      expect(result.isRight()).toBe(true);
      expect(mockCommunityRepository.findById).toHaveBeenCalledWith(
        community.id,
      );
      expect(mockCommunityRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: community.id,
          causes: expect.arrayContaining([
            expect.objectContaining({ id: causeId, closed: true }),
          ]),
        }),
      );
      expect(community.causes[0].closed).toBe(true);
      expect(mockDomainEvents.dispatch).toHaveBeenCalledWith(community);

      const events = community.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].constructor).toBe(CauseClosedEvent);
    });
  });
});
