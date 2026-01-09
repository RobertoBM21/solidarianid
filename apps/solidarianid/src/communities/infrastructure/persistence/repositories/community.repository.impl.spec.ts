import { UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager, type ObjectLiteral } from 'typeorm';
import { Community } from '../../../domain/community.aggregate';
import { CommunityNotFoundError } from '../../../domain/repositories/community.repository';
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
  const communityEntity: ObjectLiteral = {
    id: communityId,
    name: 'Community',
    description: 'Desc',
    createdAt: new Date(),
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
  });

  describe('findById', () => {
    it('should find by id', async () => {
      mockEntityManager.findOne.mockResolvedValue(communityEntity);
      jest.spyOn(repo as any, 'loadAdminIds').mockResolvedValue([userId]);
      jest.spyOn(repo as any, 'loadCauseIds').mockResolvedValue([]);

      const result = await repo.findById(UniqueEntityID.create(communityId));

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.id.toString()).toBe(communityId);
      }
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
      jest
        .spyOn(repo as any, 'loadCauseIdsByCommunities')
        .mockResolvedValue(new Map());

      const result = await repo.findAll();

      expect(result).toHaveLength(1);
    });

    it('should map admin and cause ids when listing', async () => {
      mockEntityManager.find.mockResolvedValue([communityEntity]);
      jest
        .spyOn(repo as any, 'loadAdminIdsByCommunities')
        .mockResolvedValue(new Map([[communityId, [userId]]]));
      jest
        .spyOn(repo as any, 'loadCauseIdsByCommunities')
        .mockResolvedValue(
          new Map([[communityId, [UniqueEntityID.create().toString()]]]),
        );

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
