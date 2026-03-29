import { right, UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { AnonymousSupporterRepositoryImpl } from './anonymous-supporter.repository.impl';

describe('AnonymousSupporterRepositoryImpl', () => {
  let repo: AnonymousSupporterRepositoryImpl;

  const mockEntityManager = {
    upsert: jest.fn(),
  };

  const anonId = UniqueEntityID.create().toString();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnonymousSupporterRepositoryImpl,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    repo = module.get(AnonymousSupporterRepositoryImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrCreate', () => {
    it('should upsert and return supporter id', async () => {
      mockEntityManager.upsert.mockResolvedValue({
        identifiers: [{ id: anonId }],
      });

      const result = await repo.getOrCreate('Anon', 'anon@mail.com');

      expect(mockEntityManager.upsert).toHaveBeenCalled();
      expect(result).toEqual(right(UniqueEntityID.create(anonId)));
    });
  });
});
