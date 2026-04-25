import { left, right, UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteResult, EntityManager, type ObjectLiteral } from 'typeorm';
import { CauseSupport } from '../../../domain/aggregates/cause-support.aggregate';
import { CauseSupportNotFoundError } from '../../../domain/repositories/cause-support.repository';
import {
  AnonymousSupporter,
  Supporter,
  UserSupporter,
} from '../../../domain/value-objects/supporter.vo';
import { CauseSupportRepositoryImpl } from './cause-support.repository.impl';

describe('CauseSupportRepositoryImpl', () => {
  let repo: CauseSupportRepositoryImpl;

  const mockEntityManager: jest.Mocked<
    Pick<EntityManager, 'save' | 'findOne' | 'delete' | 'count' | 'exists'>
  > = {
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    exists: jest.fn(),
  };

  const supportId = UniqueEntityID.create().toString();
  const causeId = UniqueEntityID.create().toString();
  const userSupporter = UserSupporter.create(UniqueEntityID.create());
  const anonSupporter = AnonymousSupporter.create(UniqueEntityID.create());

  const userEntity: ObjectLiteral = {
    id: supportId,
    causeId,
    userId: userSupporter.id.toString(),
    anonymousUserId: null,
    date: new Date(),
  };

  const anonEntity: ObjectLiteral = {
    id: supportId,
    causeId,
    userId: null,
    anonymousUserId: anonSupporter.id.toString(),
    date: new Date(),
  };

  const makeAggregate = (supporter: Supporter) =>
    CauseSupport.create({
      causeId,
      supporter,
      date: new Date(),
    }).value as CauseSupport;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CauseSupportRepositoryImpl,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    repo = module.get(CauseSupportRepositoryImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a user support', async () => {
      const aggregate = makeAggregate(userSupporter);

      await repo.save(aggregate);

      expect(mockEntityManager.save).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: aggregate.supporter.id.toString(),
          anonymousUserId: null,
        }),
      );
    });
  });

  describe('findById', () => {
    it('should map findById to domain (user)', async () => {
      mockEntityManager.findOne.mockResolvedValue(userEntity);

      const result = await repo.findById(UniqueEntityID.create(supportId));

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.supporter.isUser()).toBe(true);
      }
    });

    it('should map findById to domain (anonymous)', async () => {
      mockEntityManager.findOne.mockResolvedValue(anonEntity);

      const result = await repo.findById(UniqueEntityID.create(supportId));

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.supporter.isAnonymous()).toBe(true);
      }
    });

    it('should return left when not found', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);

      const result = await repo.findById(UniqueEntityID.create(supportId));

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(CauseSupportNotFoundError);
      }
    });
  });

  describe('remove', () => {
    it('should remove by id', async () => {
      mockEntityManager.delete.mockResolvedValue({
        affected: 1,
      } as DeleteResult);

      const result = await repo.remove(UniqueEntityID.create(supportId));

      expect(result.isRight()).toBe(true);
    });

    it('should return left when not found', async () => {
      mockEntityManager.delete.mockResolvedValue({
        affected: 0,
      } as DeleteResult);

      const result = await repo.remove(UniqueEntityID.create(supportId));

      expect(result.isLeft()).toBe(true);
    });
  });

  describe('removeByUserAndCause', () => {
    it('should remove by user and cause', async () => {
      mockEntityManager.delete.mockResolvedValue({
        affected: 1,
      } as DeleteResult);
      const userId = UniqueEntityID.create(userSupporter.id.toString());
      const causeUniqueId = UniqueEntityID.create(causeId);

      const result = await repo.removeByUserAndCause(userId, causeUniqueId);

      expect(result.isRight()).toBe(true);
      expect(mockEntityManager.delete).toHaveBeenCalledWith(expect.anything(), {
        causeId: causeUniqueId.toString(),
        userId: userId.toString(),
      });
    });
  });

  describe('existsForSupporterAndCause', () => {
    it('should check exists for supporter and cause', async () => {
      mockEntityManager.exists.mockResolvedValue(true);

      const exists = await repo.existsForSupporterAndCause(
        userSupporter,
        UniqueEntityID.create(causeId),
      );

      expect(exists).toBe(true);
    });
  });

  describe('findBySupporterAndCause', () => {
    it('should find by supporter and cause (user)', async () => {
      mockEntityManager.findOne.mockResolvedValue(userEntity);

      const result = await repo.findBySupporterAndCause(
        userSupporter,
        UniqueEntityID.create(causeId),
      );

      expect(result).toEqual(right(expect.any(CauseSupport)));
    });

    it('should find by supporter and cause (anonymous)', async () => {
      mockEntityManager.findOne.mockResolvedValue(anonEntity);

      const result = await repo.findBySupporterAndCause(
        anonSupporter,
        UniqueEntityID.create(causeId),
      );

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.supporter.isAnonymous()).toBe(true);
      }
    });

    it('should return left when not found', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);

      const result = await repo.findBySupporterAndCause(
        userSupporter,
        UniqueEntityID.create(causeId),
      );

      expect(result).toEqual(left(expect.any(CauseSupportNotFoundError)));
    });
  });
});
