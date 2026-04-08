import { UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { Community } from '../../../domain/community.aggregate';
import { Cause } from '../../../domain/entities/cause.entity';
import { CommunityNotFoundError } from '../../../domain/repositories/community.repository';
import { CauseDbEntity } from '../entities/cause.db-entity';
import { CommunityDbEntity } from '../entities/community.db-entity';
import { CommunityRepositoryImpl } from './community.repository.impl';

describe('CommunityRepositoryImpl', () => {
  let repo: CommunityRepositoryImpl;

  const mockEntityManager: jest.Mocked<
    Pick<
      EntityManager,
      | 'save'
      | 'findOne'
      | 'find'
      | 'count'
      | 'delete'
      | 'exists'
      | 'findBy'
      | 'transaction'
      | 'upsert'
    >
  > = {
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
    findBy: jest.fn(),
    upsert: jest.fn(),
    transaction: jest.fn().mockImplementation((cb) => cb(mockEntityManager)),
  };

  const communityId = UniqueEntityID.create().toString();
  const userId = UniqueEntityID.create().toString();

  const causeEntity: Partial<CauseDbEntity> = {
    id: UniqueEntityID.create().toString(),
    communityId,
    title: 'Cause Title',
    description: 'Cause Description',
    duration: '3 months',
    ods: 3,
    closed: false,
    createdAt: new Date(),
  };
  const communityEntity: Partial<CommunityDbEntity> = {
    id: communityId,
    name: 'Community',
    description: 'Desc',
    createdAt: new Date(),
    causes: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityRepositoryImpl,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    repo = module.get(CommunityRepositoryImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a community', async () => {
      const aggregate = Community.create({
        name: 'Community',
        description: 'Desc',
        createdAt: new Date(),
        admins: [userId],
        causes: [],
      }).value as Community;

      await repo.save(aggregate);

      expect(mockEntityManager.save).toHaveBeenCalledWith(
        CommunityDbEntity,
        expect.objectContaining({
          id: expect.any(String),
        }),
      );
    });

    it('should save a community with causes', async () => {
      const causeId = UniqueEntityID.create().toString();
      const cause = Cause.create(
        {
          title: 'Cause 1',
          description: 'Cause Desc',
          duration: '3 months',
          ods: 3,
        },
        causeId,
      ).value as Cause;
      const aggregate = Community.create({
        name: 'Community',
        description: 'Desc',
        createdAt: new Date(),
        admins: [userId],
        causes: [cause],
      }).value as Community;

      await repo.save(aggregate);

      expect(mockEntityManager.save).toHaveBeenCalledWith(
        CommunityDbEntity,
        expect.objectContaining({
          id: expect.any(String),
          causes: [
            expect.objectContaining({
              id: causeId,
              title: 'Cause 1',
              description: 'Cause Desc',
              duration: '3 months',
              ods: 3,
              communityId: expect.any(String),
            }),
          ],
        }),
      );
    });
  });

  describe('findById', () => {
    it('should find by id', async () => {
      const entity = {
        ...communityEntity,
        causes: [causeEntity as CauseDbEntity],
      };
      mockEntityManager.findOne.mockResolvedValue(entity);
      jest.spyOn(repo as any, 'loadAdminIds').mockResolvedValue([userId]);

      const result = await repo.findById(UniqueEntityID.create(communityId));

      expect(result.isRight()).toBe(true);
      const community = result.value as Community;
      expect(community).toBeInstanceOf(Community);
      expect(community.id.toString()).toBe(communityId);
      expect(community.causes).toHaveLength(1);
      expect(community.causes[0]).toBeInstanceOf(Cause);
      expect(community.causes[0].id.toString()).toBe(causeEntity.id);
    });

    it('should return left when not found', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);

      const result = await repo.findById(UniqueEntityID.create(communityId));

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(CommunityNotFoundError);
      }
    });
  });

  describe('findAll', () => {
    it('should list all communities', async () => {
      mockEntityManager.find.mockResolvedValue([communityEntity]);
      jest
        .spyOn(repo as any, 'loadAdminIdsByCommunities')
        .mockResolvedValue(new Map([[communityId, [userId]]]));

      const result = await repo.findAll();

      expect(result).toHaveLength(1);
    });

    it('should map admin ids and causes when listing', async () => {
      mockEntityManager.find.mockResolvedValue([communityEntity]);
      jest
        .spyOn(repo as any, 'loadAdminIdsByCommunities')
        .mockResolvedValue(new Map([[communityId, [userId]]]));

      const result = await repo.findAll();

      const adminsArray = result[0].admins.value.map((id) => id.toString());
      expect(adminsArray).toContain(userId);
    });
  });

  describe('exists', () => {
    it('should check exists', async () => {
      mockEntityManager.count.mockResolvedValue(1);

      const exists = await repo.exists(UniqueEntityID.create(communityId));

      expect(exists).toBe(true);
    });
  });
});
