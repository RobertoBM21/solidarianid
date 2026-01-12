import { UniqueEntityID } from '@app/shared/domain';
import { CommunityProposal } from '@app/shared/domain/aggregates/community-proposal.aggregate';
import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { EntityManager } from 'typeorm';
import { CommunityProposalNotFoundError } from '../../../domain/repositories/community-proposal.repository';
import { CommunityProposalDbEntity } from '../entities/community-proposal.db-entity';
import { CommunityProposalRepositoryImpl } from './community-proposal.repository.impl';

describe('CommunityProposalRepositoryImpl', () => {
  let repository: CommunityProposalRepositoryImpl;
  let em: MockProxy<EntityManager>;

  const DEFAULT_ID = 'e7467610-d87b-4dfa-8c10-e74676100001';
  const DEFAULT_NAME = 'Proposal Name';
  const DEFAULT_DESC = 'Proposal Desc';
  const DEFAULT_REQUESTER = 'e7467610-d87b-4dfa-8c10-e74676100002';

  const makeDbEntity = (
    overrides?: Partial<CommunityProposalDbEntity>,
  ): CommunityProposalDbEntity => {
    const db = new CommunityProposalDbEntity();
    db.id = overrides?.id ?? DEFAULT_ID;
    db.name = overrides?.name ?? DEFAULT_NAME;
    db.description = overrides?.description ?? DEFAULT_DESC;
    db.requesterId = overrides?.requesterId ?? DEFAULT_REQUESTER;
    db.accepted = overrides?.accepted ?? null; // Pending
    db.createdAt = overrides?.createdAt ?? new Date();
    return db;
  };

  beforeEach(async () => {
    em = mock<EntityManager>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityProposalRepositoryImpl,
        {
          provide: EntityManager,
          useValue: em,
        },
      ],
    }).compile();

    repository = module.get<CommunityProposalRepositoryImpl>(
      CommunityProposalRepositoryImpl,
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('save', () => {
    it('should save proposal to database', async () => {
      const proposal = CommunityProposal.create(
        {
          name: DEFAULT_NAME,
          description: DEFAULT_DESC,
          requesterId: DEFAULT_REQUESTER,
          accepted: null,
        },
        UniqueEntityID.create(DEFAULT_ID).toString(),
      ).value as CommunityProposal;

      await repository.save(proposal);

      expect(em.save).toHaveBeenCalledTimes(1);
      const [entityClass, entityInstance] = em.save.mock.calls[0];
      expect(entityClass).toBe(CommunityProposalDbEntity);
      expect(entityInstance).toMatchObject({
        id: DEFAULT_ID,
        name: DEFAULT_NAME,
        description: DEFAULT_DESC,
        requesterId: DEFAULT_REQUESTER,
      });
    });
  });

  describe('findById', () => {
    it('should return proposal when found', async () => {
      const dbEntity = makeDbEntity();
      em.findOne.mockResolvedValue(dbEntity);

      const result = await repository.findById(
        UniqueEntityID.create(DEFAULT_ID),
      );
      expect(result.isRight()).toBe(true);
      if (result.isLeft()) return;

      const proposal = result.value;
      expect(proposal.id.toString()).toBe(DEFAULT_ID);
      expect(proposal.name).toBe(DEFAULT_NAME);
      expect(em.findOne).toHaveBeenCalledWith(CommunityProposalDbEntity, {
        where: { id: DEFAULT_ID },
      });
    });

    it('should return error when not found', async () => {
      em.findOne.mockResolvedValue(null);

      const id = UniqueEntityID.create();
      const result = await repository.findById(id);

      expect(result.isLeft()).toBe(true);
      if (result.isRight()) return;

      expect(result.value).toBeInstanceOf(CommunityProposalNotFoundError);
      expect(result.value.communityProposalId).toBe(id.toString());
    });
  });

  describe('findAllPending', () => {
    it('should return pending proposals', async () => {
      const dbEntity = makeDbEntity({ accepted: null });
      em.find.mockResolvedValue([dbEntity]);

      const result = await repository.findAllPending();

      expect(result).toHaveLength(1);
      expect(result[0].id.toString()).toBe(dbEntity.id);
      expect(em.find).toHaveBeenCalled();
    });
  });

  describe('findPendingByName', () => {
    it('should return proposals matching name and pending', async () => {
      const dbEntity = makeDbEntity({ accepted: null, name: 'SearchName' });
      em.find.mockResolvedValue([dbEntity]);

      const result = await repository.findPendingByName('SearchName');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('SearchName');
      expect(em.find).toHaveBeenCalledWith(CommunityProposalDbEntity, {
        where: { name: 'SearchName', accepted: expect.anything() },
      });
    });
  });

  describe('remove', () => {
    it('should remove proposal', async () => {
      em.delete.mockResolvedValue({ affected: 1, raw: undefined });

      const result = await repository.remove(UniqueEntityID.create(DEFAULT_ID));

      expect(result.isRight()).toBe(true);
      expect(em.delete).toHaveBeenCalledWith(CommunityProposalDbEntity, {
        id: DEFAULT_ID,
      });
    });

    it('should return error if not found', async () => {
      em.delete.mockResolvedValue({ affected: 0, raw: undefined });

      const result = await repository.remove(UniqueEntityID.create(DEFAULT_ID));

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(CommunityProposalNotFoundError);
    });
  });
});
