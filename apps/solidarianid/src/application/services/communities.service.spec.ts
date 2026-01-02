import { DomainEventsPort, UniqueEntityID } from '@app/shared/domain';
import { InvalidCommunityNameError } from '@app/shared/domain/value-objects/community-name.vo';
import { Test, TestingModule } from '@nestjs/testing';
import { Community } from '../../domain/aggregates/community.aggregate';
import { CommunitiesRepository } from '../../domain/repositories/communities.repository';
import { CommunitiesService } from './communities.service';

describe('CommunitiesService', () => {
  let service: CommunitiesService;

  const mockDomainEvents = {
    dispatch: jest.fn(),
  };

  const mockCommunitiesRepository = {
    findAll: jest.fn(),
    save: jest.fn(),
  };

  const mockCommunities: Community[] = [];
  const community1 = Community.create({
    name: 'Community 1',
    description: 'Description 1',
    admins: [UniqueEntityID.create().toString()],
  });
  if (community1.isRight()) {
    mockCommunities.push(community1.value);
  }
  const community2 = Community.create({
    name: 'Community 2',
    description: 'Description 2',
    admins: [UniqueEntityID.create().toString()],
  });
  if (community2.isRight()) {
    mockCommunities.push(community2.value);
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunitiesService,
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
      mockCommunitiesRepository.findAll.mockResolvedValue(mockCommunities);

      const result = await service.listCommunities();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Community 1');
      expect(result[1].name).toBe('Community 2');
      expect(mockCommunitiesRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('proposeCommunity', () => {
    it('should propose a new community', async () => {
      const proposeData = {
        name: 'New Community',
        description: 'New Description',
      };
      const requesterId = UniqueEntityID.create().toString();

      const result = await service.proposeCommunity(proposeData, requesterId);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toHaveProperty('proposalId');
      }
      expect(mockDomainEvents.dispatch).toHaveBeenCalledTimes(1);
    });

    it('should return an error if proposal creation fails', async () => {
      const proposeData = {
        name: '', // Invalid name to trigger error
        description: 'New Description',
      };
      const requesterId = UniqueEntityID.create().toString();

      const result = await service.proposeCommunity(proposeData, requesterId);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InvalidCommunityNameError);
      }
      expect(mockDomainEvents.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('createCommunity', () => {
    it('should create a new community', async () => {
      const createData = {
        name: 'Created Community',
        description: 'Created Description',
        requesterId: UniqueEntityID.create().toString(),
      };

      const result = await service.createCommunity(createData);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toHaveProperty('id');
        expect(result.value.name).toBe(createData.name);
        expect(result.value.description).toBe(createData.description);
      }
      expect(mockCommunitiesRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should return an error if community creation fails', async () => {
      const createData = {
        name: '', // Invalid name to trigger error
        description: 'Created Description',
        requesterId: UniqueEntityID.create().toString(),
      };

      const result = await service.createCommunity(createData);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InvalidCommunityNameError);
      }
      expect(mockCommunitiesRepository.save).not.toHaveBeenCalled();
    });
  });
});
