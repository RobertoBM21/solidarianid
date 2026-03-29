import { UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteResult, EntityManager, type ObjectLiteral } from 'typeorm';
import { Cause } from '../../../domain/aggregates/cause.aggregate';
import { CauseNotFoundError } from '../../../domain/repositories/cause.repository';
import { CauseDbEntity } from '../entities/cause.db-entity';
import { CauseRepositoryImpl } from './cause.repository.impl';

describe('CauseRepositoryImpl', () => {
  let repo: CauseRepositoryImpl;

  const mockEntityManager: jest.Mocked<
    Pick<EntityManager, 'save' | 'findOne' | 'find' | 'delete' | 'findOneBy'>
  > = {
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    findOneBy: jest.fn(),
  };

  const causeId = UniqueEntityID.create().toString();
  const communityId = UniqueEntityID.create().toString();

  const sampleEntity: ObjectLiteral = {
    id: causeId,
    communityId,
    title: 'Title',
    description: 'Desc',
    duration: '1m',
    ods: 1,
    closed: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CauseRepositoryImpl,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    repo = module.get(CauseRepositoryImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save a cause using entity manager', async () => {
    const cause = Cause.create({
      title: 'Title',
      description: 'Desc',
      duration: '1m',
      ods: 1,
      communityId,
    }).value as Cause;

    await repo.save(cause);

    expect(mockEntityManager.save).toHaveBeenCalledWith(
      CauseDbEntity,
      expect.objectContaining({
        id: expect.any(String),
      }),
    );
  });

  it('should return Cause on findById', async () => {
    mockEntityManager.findOne.mockResolvedValue(sampleEntity);

    const result = await repo.findById(UniqueEntityID.create(causeId));

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.id.toString()).toBe(causeId);
    }
    expect(mockEntityManager.findOne).toHaveBeenCalledWith(CauseDbEntity, {
      where: { id: causeId },
    });
  });

  it('should return left on findById when not found', async () => {
    mockEntityManager.findOne.mockResolvedValue(null);

    const result = await repo.findById(UniqueEntityID.create(causeId));

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(CauseNotFoundError);
    }
    expect(mockEntityManager.findOne).toHaveBeenCalledWith(CauseDbEntity, {
      where: { id: causeId },
    });
  });

  it('should list causes by community', async () => {
    mockEntityManager.find.mockResolvedValue([sampleEntity]);

    const list = await repo.listByCommunity(UniqueEntityID.create(communityId));

    expect(list).toHaveLength(1);
    expect(list[0].id.toString()).toBe(causeId);
    expect(mockEntityManager.find).toHaveBeenCalledWith(CauseDbEntity, {
      where: { communityId },
      order: expect.anything(),
    });
  });

  it('should remove cause and return right when deleted', async () => {
    mockEntityManager.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

    const result = await repo.remove(UniqueEntityID.create(causeId));

    expect(result.isRight()).toBe(true);
    expect(mockEntityManager.delete).toHaveBeenCalledWith(CauseDbEntity, {
      id: causeId,
    });
  });

  it('should return left on remove when not found', async () => {
    mockEntityManager.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

    const result = await repo.remove(UniqueEntityID.create(causeId));

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(CauseNotFoundError);
    }
    expect(mockEntityManager.delete).toHaveBeenCalledWith(CauseDbEntity, {
      id: causeId,
    });
  });

  it('should find by id and community', async () => {
    mockEntityManager.findOneBy.mockResolvedValue(sampleEntity);

    const result = await repo.findByIdAndCommunity(
      UniqueEntityID.create(causeId),
      UniqueEntityID.create(communityId),
    );

    expect(result.isRight()).toBe(true);
  });

  it('should return left when findByIdAndCommunity not found', async () => {
    mockEntityManager.findOneBy.mockResolvedValue(null);

    const result = await repo.findByIdAndCommunity(
      UniqueEntityID.create(causeId),
      UniqueEntityID.create(communityId),
    );

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(CauseNotFoundError);
    }
    expect(mockEntityManager.findOneBy).toHaveBeenCalledWith(CauseDbEntity, {
      id: causeId,
      communityId: communityId,
    });
  });
});
